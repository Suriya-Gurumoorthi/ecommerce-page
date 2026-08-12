import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Product, ProductCard } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function productAvailableQuantity(product: Pick<Product, "stock_quantity" | "reserved_quantity">) {
  return product.stock_quantity === -1 ? Number.POSITIVE_INFINITY : Math.max(product.stock_quantity - product.reserved_quantity, 0);
}

export function isProductInStock(product: Pick<Product, "stock_quantity" | "reserved_quantity">) {
  return productAvailableQuantity(product) > 0;
}

export function cartProductFromCard(product: ProductCard) {
  return {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    price: product.price,
    imageUrl: product.image_url,
    quantity: 1
  };
}

export function appUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
