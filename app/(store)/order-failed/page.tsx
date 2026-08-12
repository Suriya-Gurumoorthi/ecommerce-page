import Link from "next/link";

export default function OrderFailedPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-bold">Your payment did not go through</h1>
      <p className="mt-3 text-store-muted">No payment was captured. You can retry checkout or contact support.</p>
      <Link href="/cart" className="mt-8 inline-flex rounded-full bg-store-gold px-6 py-3 font-bold text-store-bg">
        Retry payment
      </Link>
    </div>
  );
}
