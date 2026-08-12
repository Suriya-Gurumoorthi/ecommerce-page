import * as Sentry from "@sentry/nextjs";
import { type NextRequest } from "next/server";
import { fail, handleApiError, ok } from "@/lib/api";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay/verify";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { processCapturedPayment, processFailedPayment } from "@/lib/orders";

interface RazorpayWebhookEvent {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        method?: string;
      };
    };
  };
  created_at?: number;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature || !verifyRazorpayWebhookSignature(rawBody, signature, process.env.RAZORPAY_WEBHOOK_SECRET!)) {
      Sentry.captureMessage("Invalid Razorpay webhook signature", { level: "warning" });
      return fail("INVALID_SIGNATURE", 400);
    }

    const event = JSON.parse(rawBody) as RazorpayWebhookEvent;
    const eventId = `${event.event}:${event.payload.payment?.entity.id ?? event.created_at ?? Date.now()}`;

    const { data: existing } = await supabaseAdmin
      .from("webhook_events")
      .select("processed")
      .eq("provider", "razorpay")
      .eq("event_id", eventId)
      .maybeSingle<{ processed: boolean }>();

    if (existing?.processed) {
      return ok({ processed: true });
    }

    await supabaseAdmin.from("webhook_events").upsert(
      {
        provider: "razorpay",
        event_id: eventId,
        event_type: event.event,
        payload: event,
        processed: false
      },
      { onConflict: "provider,event_id" }
    );

    try {
      const payment = event.payload.payment?.entity;

      if (event.event === "payment.captured" && payment) {
        await processCapturedPayment(payment);
      }

      if (event.event === "payment.failed" && payment) {
        await processFailedPayment(payment.order_id);
      }

      await supabaseAdmin
        .from("webhook_events")
        .update({ processed: true, error: null })
        .eq("provider", "razorpay")
        .eq("event_id", eventId);
    } catch (error) {
      Sentry.captureException(error);
      await supabaseAdmin
        .from("webhook_events")
        .update({ error: error instanceof Error ? error.message : "Webhook processing failed" })
        .eq("provider", "razorpay")
        .eq("event_id", eventId);
      throw error;
    }

    return ok({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}
