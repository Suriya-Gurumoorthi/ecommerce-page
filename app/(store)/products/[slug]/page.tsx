import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/store/MarkdownContent";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductGrid } from "@/components/store/ProductGrid";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { CategoryBadge } from "@/components/store/CategoryBadge";
import { PriceDisplay } from "@/components/store/PriceDisplay";
import { StockBadge } from "@/components/store/StockBadge";
import { supabasePublic } from "@/lib/supabase/public";
import type { Product, ProductCard } from "@/types";

export const revalidate = 60;

export async function generateStaticParams() {
  const { data } = await supabasePublic.from("products").select("slug").eq("status", "active").returns<Array<{ slug: string }>>();
  return (data ?? []).map((product) => ({ slug: product.slug }));
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const supabase = supabasePublic;
  const { data: productRow } = await supabase
    .from("products")
    .select("id,slug,title,description,short_description,price,compare_at_price,category,tags,image_url,image_urls,stock_quantity,reserved_quantity,status,metadata,created_at,updated_at")
    .eq("slug", params.slug)
    .eq("status", "active")
    .single<Omit<Product, "file_path" | "file_paths">>();

  if (!productRow) {
    notFound();
  }

  // file_path / file_paths point at private storage objects and must never
  // reach the browser; downloads are only issued post-purchase via /api/downloads.
  const product: Product = { ...productRow, file_path: null, file_paths: [] };
  const gallery = product.image_urls?.length ? product.image_urls : product.image_url ? [product.image_url] : [];

  const { data: related } = await supabase
    .from("products")
    .select("id,slug,title,short_description,price,compare_at_price,category,image_url,stock_quantity,reserved_quantity")
    .eq("status", "active")
    .eq("category", product.category)
    .neq("id", product.id)
    .limit(4)
    .returns<ProductCard[]>();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.short_description,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: product.stock_quantity === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={gallery} alt={product.title} />
        <div className="space-y-5">
          <CategoryBadge category={product.category} />
          <h1 className="font-display text-4xl font-bold">{product.title}</h1>
          <p className="text-store-muted">{product.short_description}</p>
          <PriceDisplay price={product.price} compareAtPrice={product.compare_at_price} />
          <StockBadge stockQuantity={product.stock_quantity} reservedQuantity={product.reserved_quantity} />
          <AddToCartButton product={product} />
          <div className="rounded-2xl border border-store-border bg-store-surface p-5">
            <h2 className="font-semibold">Description</h2>
            <div className="mt-3">
              <MarkdownContent source={product.description} />
            </div>
          </div>
          {product.metadata.backtests ? (
            <div className="rounded-2xl border border-store-border bg-store-surface p-5">
              <h2 className="font-semibold">Backtests / Results</h2>
              <div className="mt-3">
                <MarkdownContent source={product.metadata.backtests} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <section className="mt-16">
        <h2 className="mb-6 font-display text-2xl font-bold">Related products</h2>
        <ProductGrid products={related ?? []} />
      </section>
    </div>
  );
}
