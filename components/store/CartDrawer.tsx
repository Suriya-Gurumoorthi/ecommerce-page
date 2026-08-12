"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const { items, totalPrice } = useCart();

  return (
    <aside className="rounded-2xl border border-store-border bg-store-surface p-5">
      <h2 className="font-semibold">Cart summary</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm">
            <span>{item.title} × {item.quantity}</span>
            <span>{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-between border-t border-store-border pt-4 font-bold">
        <span>Total</span>
        <span>{formatCurrency(totalPrice)}</span>
      </div>
      <Link href="/checkout" className="mt-5 block rounded-full bg-store-gold px-5 py-3 text-center font-bold text-store-bg">
        Checkout
      </Link>
    </aside>
  );
}
