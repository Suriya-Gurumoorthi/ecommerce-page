"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OrderActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function resend() {
    const response = await fetch(`/api/orders/${orderId}/resend-link`, { method: "POST" });
    setMessage(response.ok ? "Download link resent." : "Unable to resend link.");
  }

  async function refund() {
    await fetch(`/api/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "refunded" }) });
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="font-semibold">Actions</h2>
      <button onClick={() => void resend()} className="block w-full rounded-lg bg-admin-accent px-4 py-2 text-white">Resend download link</button>
      <button onClick={() => void refund()} className="block w-full rounded-lg border px-4 py-2">Mark as refunded</button>
      {message ? <p className="text-sm text-gray-500">{message}</p> : null}
    </div>
  );
}
