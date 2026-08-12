import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Product } from "@/types";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { data } = await supabaseAdmin
    .from("products")
    .select("id,slug,title,description,short_description,price,compare_at_price,category,tags,image_url,file_path,image_urls,file_paths,stock_quantity,reserved_quantity,status,metadata,created_at,updated_at")
    .eq("id", params.id)
    .single<Product>();

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Edit product</h1>
      <ProductForm product={data} />
    </div>
  );
}
