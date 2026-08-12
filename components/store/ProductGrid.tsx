import { EmptyState } from "@/components/shared/EmptyState";
import { ProductCard } from "@/components/store/ProductCard";
import type { ProductCard as ProductCardType } from "@/types";

export function ProductGrid({ products }: { products: ProductCardType[] }) {
  if (products.length === 0) {
    return <EmptyState title="No products found" description="Check back soon for new courses and e-books." href="/" action="Browse all" />;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
