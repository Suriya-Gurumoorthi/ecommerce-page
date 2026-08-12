"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Admin error</h1>
      <button onClick={reset} className="mt-4 rounded-lg bg-admin-accent px-4 py-2 text-white">Retry</button>
    </div>
  );
}
