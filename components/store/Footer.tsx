import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-store-border bg-store-bg">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-6 lg:px-10 py-12 text-sm text-store-muted md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="font-display text-xl font-bold text-store-text">Store<span className="text-store-gold">front</span></div>
          <p className="mt-2">Trading tools &amp; courses, delivered instantly.</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-store-text">Shop</p>
          <Link href="/cart" className="hover:text-store-text">Cart</Link>
          <Link href="/downloads" className="hover:text-store-text">My Downloads</Link>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-store-text">Support</p>
          <Link href="/contact" className="hover:text-store-text">Contact us</Link>
          <Link href="/refund-policy" className="hover:text-store-text">Refund policy</Link>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-store-text">Legal</p>
          <Link href="/terms" className="hover:text-store-text">Terms of service</Link>
          <Link href="/privacy" className="hover:text-store-text">Privacy policy</Link>
        </div>
      </div>
      <div className="border-t border-store-border">
        <p className="mx-auto max-w-[1440px] px-6 lg:px-10 py-5 text-xs text-store-muted">
          © {new Date().getFullYear()} Storefront. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
