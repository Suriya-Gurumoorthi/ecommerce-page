"use client";

export default function AuthError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Authentication error</h1>
      <button onClick={reset} className="mt-6 rounded-full bg-store-gold px-6 py-3 font-bold text-store-bg">Retry</button>
    </div>
  );
}
