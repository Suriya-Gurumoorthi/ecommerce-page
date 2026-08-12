import Image from "next/image";
import Link from "next/link";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

export default async function AdminProductsPage() {
  const { data } = await supabaseAdmin
    .from("products")
    .select("id,slug,title,description,short_description,price,compare_at_price,category,tags,image_url,file_path,stock_quantity,reserved_quantity,status,metadata,created_at,updated_at")
    .order("created_at", { ascending: false })
    .returns<Product[]>();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="rounded-lg bg-admin-accent px-4 py-2 text-white">Add product</Link>
      </div>
      <DataTable
        rows={data ?? []}
        empty="No products"
        columns={[
          { key: "image", header: "Image", render: (row) => <div className="relative h-10 w-10 overflow-hidden rounded bg-gray-100">{row.image_url ? <Image src={row.image_url} alt={row.title} fill className="object-cover" /> : null}</div> },
          { key: "title", header: "Title", render: (row) => row.title },
          { key: "category", header: "Category", render: (row) => row.category },
          { key: "price", header: "Price", render: (row) => formatCurrency(row.price) },
          { key: "stock", header: "Stock", render: (row) => row.stock_quantity === -1 ? "Unlimited" : row.stock_quantity },
          { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
          { key: "created", header: "Created", render: (row) => new Date(row.created_at).toLocaleDateString("en-IN") },
          { key: "actions", header: "Actions", render: (row) => <Link className="text-admin-accent" href={`/admin/products/${row.id}`}>Edit</Link> }
        ]}
      />
    </div>
  );
}
