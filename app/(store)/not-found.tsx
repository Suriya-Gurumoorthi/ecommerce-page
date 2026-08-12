import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-bold">Page not found</h1>
      <p className="mt-3 text-store-muted">This page is not available.</p>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-store-gold px-6 py-3 font-bold text-store-bg">
        Browse courses &amp; e-books
      </Link>
    </div>
  );
}
