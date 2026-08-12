import * as Sentry from "@sentry/nextjs";
import { type NextRequest } from "next/server";
import { fail, handleApiError, ok, requireCron } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { razorpay } from "@/lib/razorpay/client";
import { processCapturedPayment, processFailedPayment } from "@/lib/orders";
import type { Order } from "@/types";

export async function GET(request: NextRequest) {
  try {
    if (!requireCron(request)) {
      return fail("UNAUTHORIZED", 401);
    }

    const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("id,order_number,user_id,customer_email,customer_name,status,total_amount,currency,razorpay_order_id,razorpay_payment_id,razorpay_signature,payment_method,notes,created_at,updated_at,paid_at,expires_at")
      .eq("status", "pending")
      .lt("created_at", cutoff)
      .not("razorpay_order_id", "is", null)
      .returns<Order[]>();

    if (error) {
      throw error;
    }

    let processed = 0;

    for (const order of orders ?? []) {
      if (!order.razorpay_order_id) {
        continue;
      }

      const payments = (await razorpay.orders.fetchPayments(order.razorpay_order_id)) as {
        items: Array<{ id: string; order_id: string; amount: number; status: string; method?: string }>;
      };
      const captured = payments.items.find((payment) => payment.status === "captured");
      const failed = payments.items.find((payment) => payment.status === "failed");

      if (captured) {
        await processCapturedPayment(captured);
        processed += 1;
      } else if (failed) {
        await processFailedPayment(order.razorpay_order_id);
        processed += 1;
      } else {
        Sentry.captureMessage("Pending order requires manual review", { level: "info", extra: { orderId: order.id } });
      }
    }

    return ok({ processed });
  } catch (error) {
    return handleApiError(error);
  }
}
