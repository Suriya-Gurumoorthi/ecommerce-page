import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/store/ProductGrid";
import { PRODUCT_CATEGORIES, categoryToSlug, slugToCategory } from "@/lib/categories";
import { supabasePublic } from "@/lib/supabase/public";
import type { ProductCard } from "@/types";

export const revalidate = 60;

export function generateStaticParams() {
  return PRODUCT_CATEGORIES.map((category) => ({ slug: categoryToSlug(category) }));
}

async function getProductsByCategory(category: string) {
  const { data } = await supabasePublic
    .from("products")
    .select("id,slug,title,short_description,price,compare_at_price,category,image_url,stock_quantity,reserved_quantity")
    .eq("status", "active")
    .ilike("category", category)
    .order("created_at", { ascending: false })
    .returns<ProductCard[]>();

  return data ?? [];
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = slugToCategory(params.slug);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(category);

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-10">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold md:text-5xl">{category}</h1>
        <p className="mt-3 max-w-2xl text-store-muted">Browse all {category.toLowerCase()} products.</p>
      </div>
      {products.length ? <ProductGrid products={products} /> : <p className="text-store-muted">No products in this category yet.</p>}
    </section>
  );
}
