import { type NextRequest } from "next/server";
import { fail, handleApiError, ok } from "@/lib/api";
import { RazorpayVerifySchema } from "@/lib/validations/schemas";
import { verifyRazorpayPaymentSignature } from "@/lib/razorpay/verify";
import { processCapturedPayment } from "@/lib/orders";
import { razorpay } from "@/lib/razorpay/client";

export async function POST(request: NextRequest) {
  try {
    const payload = RazorpayVerifySchema.parse(await request.json());
    const valid = verifyRazorpayPaymentSignature(
      payload.razorpay_order_id,
      payload.razorpay_payment_id,
      payload.razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET!
    );

    if (!valid) {
      return fail("INVALID_SIGNATURE", 400, "Payment verification failed.");
    }

    const payment = (await razorpay.payments.fetch(payload.razorpay_payment_id)) as {
      id: string;
      order_id: string;
      amount: number;
      method?: string;
    };

    const order = await processCapturedPayment({
      id: payload.razorpay_payment_id,
      order_id: payload.razorpay_order_id,
      amount: payment.amount,
      method: payment.method
    });

    return ok({ orderId: order.id, orderNumber: order.order_number });
  } catch (error) {
    return handleApiError(error);
  }
}
