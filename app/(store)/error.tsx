"use client";

export default function StoreError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-store-muted">The market moved against this request. Try again.</p>
      <button onClick={reset} className="mt-6 rounded-full bg-store-gold px-6 py-3 font-bold text-store-bg">
        Retry
      </button>
    </div>
  );
}
