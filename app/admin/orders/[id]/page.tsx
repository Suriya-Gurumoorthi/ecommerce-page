import { notFound } from "next/navigation";
import { OrderActions } from "@/components/admin/OrderActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";
import type { OrderWithItems } from "@/types";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const { data } = await supabaseAdmin
    .from("orders")
    .select("id,order_number,user_id,customer_email,customer_name,status,total_amount,currency,razorpay_order_id,razorpay_payment_id,razorpay_signature,payment_method,notes,created_at,updated_at,paid_at,expires_at,order_items(id,order_id,product_id,product_title,product_slug,quantity,unit_price,total_price,created_at)")
    .eq("id", params.id)
    .single<OrderWithItems>();

  if (!data) {
    notFound();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-5">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Order #{data.order_number}</h1>
            <StatusBadge status={data.status} />
          </div>
          <p className="mt-2 text-gray-500">{data.customer_name ?? "Customer"} · {data.customer_email}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold">Items</h2>
          <div className="mt-4 divide-y">
            {data.order_items.map((item) => (
              <div key={item.id} className="flex justify-between py-3">
                <span>{item.product_title} × {item.quantity}</span>
                <span>{formatCurrency(item.total_price)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t pt-4 font-bold">
            <span>Total</span>
            <span>{formatCurrency(data.total_amount)}</span>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold">Payment details</h2>
          <p className="mt-2 text-sm text-gray-600">Razorpay order: {data.razorpay_order_id ?? "—"}</p>
          <p className="text-sm text-gray-600">Payment ID: {data.razorpay_payment_id ?? "—"}</p>
          <p className="text-sm text-gray-600">Method: {data.payment_method ?? "—"}</p>
        </div>
      </section>
      <OrderActions orderId={data.id} />
    </div>
  );
}
