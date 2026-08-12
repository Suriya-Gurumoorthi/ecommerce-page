import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";
import type { OrderWithItems } from "@/types";

/** Turn a stored storage path into a readable filename for display. */
function displayName(path: string) {
  const segment = path.split("/").pop() ?? path;
  return segment.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i, "");
}

export default async function DownloadsPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/downloads");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id,order_number,user_id,customer_email,customer_name,status,total_amount,currency,razorpay_order_id,razorpay_payment_id,razorpay_signature,payment_method,notes,created_at,updated_at,paid_at,expires_at,order_items(id,order_id,product_id,product_title,product_slug,quantity,unit_price,total_price,created_at)")
    .eq("user_id", user.id)
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .returns<OrderWithItems[]>();

  if (!orders?.length) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <EmptyState title="No downloads yet" description="Paid purchases will appear here after payment is verified." href="/" action="Browse courses & e-books" />
      </div>
    );
  }

  // Resolve the private PDF paths for every purchased product server-side. Only
  // filenames are rendered; the storage paths never reach the browser.
  const productIds = Array.from(new Set(orders.flatMap((order) => order.order_items.map((item) => item.product_id).filter((id): id is string => Boolean(id)))));
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("id,file_path,file_paths")
    .in("id", productIds.length ? productIds : ["00000000-0000-0000-0000-000000000000"])
    .returns<Array<{ id: string; file_path: string | null; file_paths: string[] | null }>>();

  const filesByProduct = new Map<string, string[]>();
  for (const product of products ?? []) {
    filesByProduct.set(product.id, product.file_paths?.length ? product.file_paths : product.file_path ? [product.file_path] : []);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold">Downloads</h1>
      <div className="mt-8 space-y-5">
        {orders.map((order) => (
          <section key={order.id} className="rounded-2xl border border-store-border bg-store-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Order #{order.order_number}</h2>
                <p className="text-sm text-store-muted">{new Date(order.created_at).toLocaleDateString("en-IN")} · {formatCurrency(order.total_amount)}</p>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {order.order_items.map((item) => {
                const files = item.product_id ? filesByProduct.get(item.product_id) ?? [] : [];
                return (
                  <div key={item.id} className="rounded-xl border border-store-border/60 p-4">
                    <p className="text-sm font-medium">{item.product_title} × {item.quantity}</p>
                    {files.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {files.map((path, index) => (
                          <Link
                            key={path}
                            href={`/api/downloads/${order.id}?item=${item.id}&i=${index}`}
                            target="_blank"
                            className="rounded-full bg-store-gold px-4 py-1.5 text-sm font-bold text-store-bg"
                          >
                            {files.length > 1 ? `Download ${displayName(path)}` : "Download"}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-store-muted">No downloadable file attached.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
