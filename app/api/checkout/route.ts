import { type NextRequest } from "next/server";
import { fail, handleApiError, ok, rateLimit, requireUser } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CheckoutSchema } from "@/lib/validations/schemas";
import { razorpay } from "@/lib/razorpay/client";
import { productAvailableQuantity } from "@/lib/utils";
import type { CheckoutSession, Order, Product, RazorpayOrder } from "@/types";

export async function POST(request: NextRequest) {
  try {
    if (!(await rateLimit(request, "checkout", 8))) {
      return fail("RATE_LIMITED", 429, "Too many checkout attempts. Try again shortly.");
    }

    const user = await requireUser();

    if (!user) {
      return fail("UNAUTHORIZED", 401);
    }

    const payload = CheckoutSchema.parse(await request.json());
    const productIds = payload.items.map((item) => item.productId);
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id,slug,title,description,short_description,price,compare_at_price,category,tags,image_url,file_path,stock_quantity,reserved_quantity,status,metadata,created_at,updated_at")
      .in("id", productIds)
      .returns<Product[]>();

    if (productsError) {
      throw productsError;
    }

    const productMap = new Map((products ?? []).map((product) => [product.id, product]));

    for (const item of payload.items) {
      const product = productMap.get(item.productId);

      if (!product || product.status !== "active") {
        return fail("PRODUCT_UNAVAILABLE", 400, `Product ${item.productId} is unavailable.`);
      }

      if (productAvailableQuantity(product) < item.quantity) {
        return fail("INSUFFICIENT_STOCK", 400, `${product.title} does not have enough available stock.`);
      }
    }

    const totalAmount = payload.items.reduce((sum, item) => {
      const product = productMap.get(item.productId);
      return sum + (product?.price ?? 0) * item.quantity;
    }, 0);

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: "",
        user_id: user.id,
        customer_email: payload.customerEmail,
        customer_name: payload.customerName,
        total_amount: totalAmount,
        currency: "INR"
      })
      .select("id,order_number,user_id,customer_email,customer_name,status,total_amount,currency,razorpay_order_id,razorpay_payment_id,razorpay_signature,payment_method,notes,created_at,updated_at,paid_at,expires_at")
      .single<Order>();

    if (orderError || !order) {
      throw orderError ?? new Error("ORDER_CREATE_FAILED");
    }

    for (const item of payload.items) {
      const product = productMap.get(item.productId);

      if (!product) {
        continue;
      }

      await supabaseAdmin.rpc("reserve_product_stock", {
        product_id_input: product.id,
        quantity_input: item.quantity
      });

      await supabaseAdmin.from("order_items").insert({
        order_id: order.id,
        product_id: product.id,
        product_title: product.title,
        product_slug: product.slug,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: product.price * item.quantity
      });

      await supabaseAdmin.from("stock_reservations").insert({
        order_id: order.id,
        product_id: product.id,
        quantity: item.quantity
      });
    }

    const razorpayOrder = (await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: order.id,
      notes: { order_number: order.order_number }
    })) as RazorpayOrder;

    await supabaseAdmin.from("orders").update({ razorpay_order_id: razorpayOrder.id }).eq("id", order.id);

    return ok<CheckoutSession>({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID ?? ""
    });
  } catch (error) {
    return handleApiError(error);
  }
}
