import { type NextRequest } from "next/server";
import { fail, handleApiError, ok, requireAdminProfile } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendOrderConfirmation } from "@/lib/email/resend";
import type { Order, OrderItem } from "@/types";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdminProfile();

    if (!admin) {
      return fail("FORBIDDEN", 403);
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id,order_number,user_id,customer_email,customer_name,status,total_amount,currency,razorpay_order_id,razorpay_payment_id,razorpay_signature,payment_method,notes,created_at,updated_at,paid_at,expires_at")
      .eq("id", params.id)
      .single<Order>();

    if (orderError || !order) {
      return fail("NOT_FOUND", 404);
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await supabaseAdmin.from("downloads").update({ token: crypto.randomUUID().replaceAll("-", ""), expires_at: expiresAt }).eq("order_id", order.id);

    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("id,order_id,product_id,product_title,product_slug,quantity,unit_price,total_price,created_at")
      .eq("order_id", order.id)
      .returns<OrderItem[]>();

    sendOrderConfirmation(order, items ?? []);
    return ok({ resent: true, expiresAt });
  } catch (error) {
    return handleApiError(error);
  }
}
