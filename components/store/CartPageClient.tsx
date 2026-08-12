"use client";

import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";

export function CartPageClient() {
  const cart = useCart();

  if (cart.items.length === 0) {
    return <EmptyState title="Your cart is empty" description="Add a course or e-book to continue." href="/" action="Browse courses & e-books" />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {cart.items.map((item) => (
          <div key={item.productId} className="flex gap-4 rounded-2xl border border-store-border bg-store-surface p-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-store-bg">
              {item.imageUrl ? <Image src={item.imageUrl} alt={item.title} fill className="object-cover" /> : null}
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-sm text-store-muted">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="rounded border border-store-border px-3 py-1" onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button className="rounded border border-store-border px-3 py-1" onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)}>+</button>
                <button className="ml-auto text-sm text-red-400" onClick={() => cart.removeItem(item.productId)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="h-fit rounded-2xl border border-store-border bg-store-surface p-6">
        <h2 className="font-semibold">Order summary</h2>
        <p className="mt-2 text-sm text-store-muted">Digital goods. Nothing extra at checkout.</p>
        <div className="mt-5 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatCurrency(cart.totalPrice)}</span>
        </div>
        <Link href="/checkout" className="mt-6 block rounded-full bg-store-gold px-5 py-3 text-center font-bold text-store-bg">
          Proceed to Checkout
        </Link>
      </aside>
    </div>
  );
}
