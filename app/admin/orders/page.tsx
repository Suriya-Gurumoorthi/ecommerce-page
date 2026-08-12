import Link from "next/link";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";
import type { OrderWithItems } from "@/types";

export default async function AdminOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  let query = supabaseAdmin
    .from("orders")
    .select("id,order_number,user_id,customer_email,customer_name,status,total_amount,currency,razorpay_order_id,razorpay_payment_id,razorpay_signature,payment_method,notes,created_at,updated_at,paid_at,expires_at,order_items(id,order_id,product_id,product_title,product_slug,quantity,unit_price,total_price,created_at)")
    .order("created_at", { ascending: false });

  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }

  const { data } = await query.returns<OrderWithItems[]>();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <a href="/api/orders?export=csv" className="rounded-lg border px-4 py-2">Export CSV</a>
      </div>
      <div className="flex gap-2">
        {["", "pending", "paid", "failed", "refunded", "expired"].map((status) => (
          <Link key={status || "all"} className="rounded-lg border bg-white px-3 py-2 text-sm" href={status ? `/admin/orders?status=${status}` : "/admin/orders"}>
            {status || "all"}
          </Link>
        ))}
      </div>
      <DataTable
        rows={data ?? []}
        empty="No orders"
        columns={[
          { key: "order", header: "Order#", render: (row) => <Link className="text-admin-accent" href={`/admin/orders/${row.id}`}>{row.order_number}</Link> },
          { key: "customer", header: "Customer", render: (row) => row.customer_email },
          { key: "products", header: "Products", render: (row) => row.order_items.map((item) => item.product_title).join(", ") },
          { key: "amount", header: "Amount", render: (row) => formatCurrency(row.total_amount) },
          { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
          { key: "method", header: "Payment", render: (row) => row.payment_method ?? "—" },
          { key: "date", header: "Date", render: (row) => new Date(row.created_at).toLocaleString("en-IN") }
        ]}
      />
    </div>
  );
}
