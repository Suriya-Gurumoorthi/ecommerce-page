import { Download, ShieldCheck, Headphones } from "lucide-react";
import { ProductGrid } from "@/components/store/ProductGrid";
import { supabasePublic } from "@/lib/supabase/public";
import type { ProductCard } from "@/types";

export const revalidate = 60;

async function getProducts() {
  const { data } = await supabasePublic
    .from("products")
    .select("id,slug,title,short_description,price,compare_at_price,category,image_url,stock_quantity,reserved_quantity")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .returns<ProductCard[]>();

  return data ?? [];
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <section className="relative overflow-hidden border-b border-store-border">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-store-gold/10 blur-3xl" />
        <div className="mx-auto max-w-[1440px] px-6 py-20 lg:px-10">
          <span className="inline-flex rounded-full border border-store-gold/40 px-3 py-1 text-xs font-medium uppercase tracking-wider text-store-gold">
            Trading tools &amp; education
          </span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight md:text-6xl">
            Expert Advisors, indicators &amp; courses that <span className="text-store-gold">give you an edge</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-store-muted">
            Buy once and get instant access after payment — download straight to MT4/MT5 or read on any device.
          </p>
        </div>
      </section>

      <section className="border-b border-store-border">
        <div className="mx-auto grid max-w-[1440px] gap-4 px-6 py-6 text-sm sm:grid-cols-3 lg:px-10">
          {[
            { icon: Download, title: "Instant delivery", copy: "Download the moment payment clears." },
            { icon: ShieldCheck, title: "Secure checkout", copy: "Payments processed securely via Razorpay." },
            { icon: Headphones, title: "Support included", copy: "Reach us any time after purchase." }
          ].map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-store-border bg-store-surface text-store-gold">
                <Icon size={18} />
              </span>
              <div>
                <p className="font-semibold text-store-text">{title}</p>
                <p className="text-store-muted">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-10">
        <div className="mb-10">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Latest releases</h2>
          <p className="mt-3 max-w-2xl text-store-muted">Fresh tools and courses, ready to download instantly.</p>
        </div>
        <ProductGrid products={products} />
      </section>
    </>
  );
}
