"use client";

import { useCart } from "@/hooks/useCart";
import { isProductInStock } from "@/lib/utils";
import type { Product } from "@/types";

export function AddToCartButton({ product }: { product: Product }) {
  const cart = useCart();
  const inStock = isProductInStock(product);

  return (
    <button
      disabled={!inStock}
      onClick={() => cart.addItem(product, 1)}
      className="w-full rounded-full bg-store-gold px-6 py-4 font-bold text-store-bg disabled:cursor-not-allowed disabled:opacity-50"
    >
      {inStock ? "Add to Cart" : "Out of Stock"}
    </button>
  );
}
