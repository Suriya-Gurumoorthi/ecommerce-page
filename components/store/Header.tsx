"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { categoryToSlug, PRODUCT_CATEGORIES } from "@/lib/categories";

export function Header() {
  const { totalItems } = useCart();
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-store-border bg-store-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 lg:px-10 py-4">
        <Link href="/" className="font-display text-xl font-bold text-store-text">
          Store<span className="text-store-gold">front</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-store-muted md:flex">
          {PRODUCT_CATEGORIES.map((category) => (
            <Link key={category} href={`/category/${categoryToSlug(category)}`} className="hover:text-store-text">
              {category}
            </Link>
          ))}
          <Link href="/downloads" className="hover:text-store-text">My Downloads</Link>
        </nav>
        <div className="flex items-center gap-4">
          {loading ? null : user ? (
            <div className="flex items-center gap-3 text-sm text-store-muted">
              <span className="hidden sm:inline">{user.email}</span>
              <LogoutButton className="text-store-muted hover:text-store-text" />
            </div>
          ) : (
            <Link href="/login" className="text-sm text-store-muted">
              Login
            </Link>
          )}
          <Link href="/cart" className="relative rounded-full border border-store-border p-2 text-store-text">
            <ShoppingCart size={18} />
            {totalItems > 0 ? <span className="absolute -right-2 -top-2 rounded-full bg-store-gold px-1.5 text-xs font-bold text-store-bg">{totalItems}</span> : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
