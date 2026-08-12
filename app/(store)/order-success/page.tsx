import Link from "next/link";

export default function OrderSuccessPage({ searchParams }: { searchParams: { orderId?: string } }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-bold">Payment processed</h1>
      <p className="mt-3 text-store-muted">Your order {searchParams.orderId ? `(${searchParams.orderId}) ` : ""}is confirmed. Check your email for confirmation.</p>
      <Link href="/downloads" className="mt-8 inline-flex rounded-full bg-store-gold px-6 py-3 font-bold text-store-bg">
        Go to downloads
      </Link>
    </div>
  );
}
