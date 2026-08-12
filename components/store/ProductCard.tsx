"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { CategoryBadge } from "@/components/store/CategoryBadge";
import { PriceDisplay } from "@/components/store/PriceDisplay";
import { StockBadge } from "@/components/store/StockBadge";
import { isProductInStock } from "@/lib/utils";
import type { ProductCard as ProductCardType } from "@/types";

export function ProductCard({ product }: { product: ProductCardType }) {
  const cart = useCart();
  const inStock = isProductInStock({ stock_quantity: product.stock_quantity, reserved_quantity: product.reserved_quantity });
  const quantityInCart = cart.items.find((item) => item.productId === product.id)?.quantity ?? 0;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-store-border bg-store-surface p-4 transition hover:-translate-y-1 hover:border-store-gold/60">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-store-bg">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.title} fill sizes="(min-width: 1280px) 320px, (min-width: 640px) 45vw, 90vw" className="object-cover transition duration-300 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-store-muted">No image</div>
          )}
        </div>
      </Link>
      <div className="mt-3 flex flex-1 flex-col gap-2">
        <CategoryBadge category={product.category} />
        <div>
          <Link href={`/products/${product.slug}`} className="text-sm font-semibold text-store-text">
            {product.title}
          </Link>
          <p className="mt-1 line-clamp-1 text-xs text-store-muted">{product.short_description}</p>
        </div>
        <PriceDisplay price={product.price} compareAtPrice={product.compare_at_price} />
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <StockBadge stockQuantity={product.stock_quantity} reservedQuantity={product.reserved_quantity} />
          {quantityInCart > 0 ? (
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-store-gold p-1 text-store-bg">
              <button
                type="button"
                aria-label="Decrease quantity"
                className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-black/10"
                onClick={() => cart.updateQuantity(product.id, quantityInCart - 1)}
              >
                <Minus size={14} strokeWidth={3} />
              </button>
              <span className="w-5 text-center text-sm font-bold tabular-nums">{quantityInCart}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!inStock}
                onClick={() => cart.addItem(product, 1)}
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              className="shrink-0 rounded-full bg-store-gold px-4 py-2 text-sm font-bold text-store-bg transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!inStock}
              onClick={() => cart.addItem(product, 1)}
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
