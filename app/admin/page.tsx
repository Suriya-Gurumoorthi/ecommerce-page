import Link from "next/link";
import { DataTable } from "@/components/admin/DataTable";
import { KPICard } from "@/components/admin/KPICard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";
import type { OrderWithItems, Product } from "@/types";

export default async function AdminDashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [{ data: todayOrders }, { count: totalOrders }, { count: totalProducts }, { data: recentOrders }, { data: lowStock }] = await Promise.all([
    supabaseAdmin.from("orders").select("total_amount").eq("status", "paid").gte("created_at", today.toISOString()).returns<Array<{ total_amount: number }>>(),
    supabaseAdmin.from("orders").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("orders").select("id,order_number,user_id,customer_email,customer_name,status,total_amount,currency,razorpay_order_id,razorpay_payment_id,razorpay_signature,payment_method,notes,created_at,updated_at,paid_at,expires_at,order_items(id,order_id,product_id,product_title,product_slug,quantity,unit_price,total_price,created_at)").order("created_at", { ascending: false }).limit(10).returns<OrderWithItems[]>(),
    supabaseAdmin.from("products").select("id,slug,title,description,short_description,price,compare_at_price,category,tags,image_url,file_path,stock_quantity,reserved_quantity,status,metadata,created_at,updated_at").lt("stock_quantity", 5).gte("stock_quantity", 0).returns<Product[]>()
  ]);

  const revenue = (todayOrders ?? []).reduce((sum, order) => sum + order.total_amount, 0);
  const chartData = Array.from({ length: 30 }, (_, index) => ({ date: `${index + 1}`, revenue: 0 }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/admin/products/new" className="rounded-lg bg-admin-accent px-4 py-2 text-white">Add product</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard label="Today's revenue" value={formatCurrency(revenue)} />
        <KPICard label="Orders today" value={String(todayOrders?.length ?? 0)} />
        <KPICard label="Total orders" value={String(totalOrders ?? 0)} />
        <KPICard label="Total products" value={String(totalProducts ?? 0)} />
      </div>
      <RevenueChart data={chartData} />
      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent orders</h2>
        <DataTable
          rows={recentOrders ?? []}
          empty="No recent orders"
          columns={[
            { key: "order", header: "Order", render: (row) => <Link className="text-admin-accent" href={`/admin/orders/${row.id}`}>{row.order_number}</Link> },
            { key: "customer", header: "Customer", render: (row) => row.customer_email },
            { key: "amount", header: "Amount", render: (row) => formatCurrency(row.total_amount) },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> }
          ]}
        />
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Low stock alerts</h2>
        <DataTable
          rows={lowStock ?? []}
          empty="No low stock products"
          columns={[
            { key: "title", header: "Product", render: (row) => row.title },
            { key: "stock", header: "Stock", render: (row) => row.stock_quantity },
            { key: "action", header: "Action", render: (row) => <Link className="text-admin-accent" href={`/admin/products/${row.id}`}>Edit</Link> }
          ]}
        />
      </section>
    </div>
  );
}
