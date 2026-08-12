import * as Sentry from "@sentry/nextjs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendNewOrderNotification, sendOrderConfirmation, sendPaymentFailed } from "@/lib/email/resend";
import type { Order, OrderItem, Product } from "@/types";

export interface RazorpayCapturedPayment {
  id: string;
  order_id: string;
  amount: number;
  method?: string;
}

export async function processCapturedPayment(payment: RazorpayCapturedPayment) {
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("id,order_number,user_id,customer_email,customer_name,status,total_amount,currency,razorpay_order_id,razorpay_payment_id,razorpay_signature,payment_method,notes,created_at,updated_at,paid_at,expires_at")
    .eq("razorpay_order_id", payment.order_id)
    .single<Order>();

  if (orderError || !order) {
    throw new Error("ORDER_NOT_FOUND");
  }

  if (order.status === "paid") {
    return order;
  }

  if (Math.round(order.total_amount * 100) !== payment.amount) {
    Sentry.captureMessage("Razorpay payment amount mismatch", {
      level: "error",
      extra: { orderId: order.id, razorpayOrderId: payment.order_id }
    });
    throw new Error("PAYMENT_AMOUNT_MISMATCH");
  }

  const { data: items, error: itemsError } = await supabaseAdmin
    .from("order_items")
    .select("id,order_id,product_id,product_title,product_slug,quantity,unit_price,total_price,created_at")
    .eq("order_id", order.id)
    .returns<OrderItem[]>();

  if (itemsError) {
    throw itemsError;
  }

  for (const item of items ?? []) {
    if (item.product_id) {
      const { data: product } = await supabaseAdmin
        .from("products")
        .select("id,slug,title,description,short_description,price,compare_at_price,category,tags,image_url,file_path,stock_quantity,reserved_quantity,status,metadata,created_at,updated_at")
        .eq("id", item.product_id)
        .single<Product>();

      if (product && product.stock_quantity !== -1) {
        await supabaseAdmin
          .from("products")
          .update({
            stock_quantity: Math.max(product.stock_quantity - item.quantity, 0),
            reserved_quantity: Math.max(product.reserved_quantity - item.quantity, 0)
          })
          .eq("id", product.id);
      }
    }

    await supabaseAdmin.from("downloads").upsert(
      {
        order_id: order.id,
        order_item_id: item.id,
        user_id: order.user_id,
        product_id: item.product_id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      { onConflict: "order_item_id" }
    );
  }

  await supabaseAdmin
    .from("stock_reservations")
    .update({ released: true })
    .eq("order_id", order.id);

  const { data: updatedOrder, error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      status: "paid",
      razorpay_payment_id: payment.id,
      payment_method: payment.method ?? null,
      paid_at: new Date().toISOString()
    })
    .eq("id", order.id)
    .select("id,order_number,user_id,customer_email,customer_name,status,total_amount,currency,razorpay_order_id,razorpay_payment_id,razorpay_signature,payment_method,notes,created_at,updated_at,paid_at,expires_at")
    .single<Order>();

  if (updateError || !updatedOrder) {
    throw updateError ?? new Error("ORDER_UPDATE_FAILED");
  }

  sendOrderConfirmation(updatedOrder, items ?? []);
  sendNewOrderNotification(updatedOrder, items ?? []);
  return updatedOrder;
}

export async function processFailedPayment(razorpayOrderId: string) {
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id,order_number,user_id,customer_email,customer_name,status,total_amount,currency,razorpay_order_id,razorpay_payment_id,razorpay_signature,payment_method,notes,created_at,updated_at,paid_at,expires_at")
    .eq("razorpay_order_id", razorpayOrderId)
    .single<Order>();

  if (!order || order.status !== "pending") {
    return;
  }

  const { data: reservations } = await supabaseAdmin
    .from("stock_reservations")
    .select("id,product_id,quantity")
    .eq("order_id", order.id)
    .eq("released", false)
    .returns<Array<{ id: string; product_id: string; quantity: number }>>();

  for (const reservation of reservations ?? []) {
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("reserved_quantity,stock_quantity")
      .eq("id", reservation.product_id)
      .single<{ reserved_quantity: number; stock_quantity: number }>();

    if (product && product.stock_quantity !== -1) {
      await supabaseAdmin
        .from("products")
        .update({ reserved_quantity: Math.max(product.reserved_quantity - reservation.quantity, 0) })
        .eq("id", reservation.product_id);
    }
  }

  await supabaseAdmin.from("stock_reservations").update({ released: true }).eq("order_id", order.id);
  await supabaseAdmin.from("orders").update({ status: "failed" }).eq("id", order.id);
  sendPaymentFailed(order);
}
