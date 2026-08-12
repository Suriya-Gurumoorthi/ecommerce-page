"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { CheckoutSchema } from "@/lib/validations/schemas";
import { formatCurrency } from "@/lib/utils";
import type { ApiResponse, CheckoutSession, RazorpayPaymentResult } from "@/types";

export function CheckoutPageClient({ initialEmail, initialName }: { initialEmail: string; initialName: string }) {
  const cart = useCart();
  const router = useRouter();
  const [customerEmail, setCustomerEmail] = useState(initialEmail);
  const [customerName, setCustomerName] = useState(initialName);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function verifyPayment(response: RazorpayPaymentResult, orderId: string) {
    const verifyResponse = await fetch("/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response)
    });
    const body = (await verifyResponse.json()) as ApiResponse<{ orderId: string; orderNumber: string }>;

    if (!body.success) {
      setError(body.message ?? "Payment verification failed.");
      setLoading(false);
      return;
    }

    cart.clearCart();
    router.push(`/order-success?orderId=${orderId}`);
  }

  async function startCheckout() {
    setError("");
    const parsed = CheckoutSchema.safeParse({
      items: cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      customerEmail,
      customerName
    });

    if (!parsed.success) {
      setError("Enter a valid name, email, and at least one product.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data)
    });
    const body = (await response.json()) as ApiResponse<CheckoutSession>;

    if (!body.success) {
      setError(body.message ?? "Checkout failed. Try again.");
      setLoading(false);
      return;
    }

    if (!window.Razorpay) {
      setError("Razorpay did not load. Refresh and try again.");
      setLoading(false);
      return;
    }

    new window.Razorpay({
      key: body.data.keyId,
      amount: body.data.amount,
      currency: body.data.currency,
      name: "Storefront",
      description: "Digital product checkout",
      order_id: body.data.razorpayOrderId,
      prefill: { name: customerName, email: customerEmail },
      handler: (payment: RazorpayPaymentResult) => void verifyPayment(payment, body.data.orderId),
      modal: {
        ondismiss: () => setLoading(false)
      }
    }).open();
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <section className="rounded-2xl border border-store-border bg-store-surface p-6">
          <h1 className="font-display text-3xl font-bold">Checkout</h1>
          <div className="mt-6 space-y-4">
            <label className="block text-sm">
              Full name
              <input className="mt-1 w-full rounded-lg border border-store-border bg-store-bg px-3 py-3 transition placeholder:text-store-muted focus:border-store-gold focus:outline-none focus:ring-2 focus:ring-store-gold/30" value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
            </label>
            <label className="block text-sm">
              Email
              <input className="mt-1 w-full rounded-lg border border-store-border bg-store-bg px-3 py-3 transition placeholder:text-store-muted focus:border-store-gold focus:outline-none focus:ring-2 focus:ring-store-gold/30" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} />
            </label>
            {error ? <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p> : null}
            <button disabled={loading || cart.items.length === 0} onClick={startCheckout} className="w-full rounded-full bg-store-gold px-6 py-4 font-bold text-store-bg disabled:opacity-50">
              {loading ? "Opening Razorpay..." : "Pay securely"}
            </button>
          </div>
        </section>
        <aside className="h-fit rounded-2xl border border-store-border bg-store-surface p-6">
          <h2 className="font-semibold">Order summary</h2>
          <div className="mt-4 space-y-3">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span>{item.title} × {item.quantity}</span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between border-t border-store-border pt-4 font-bold">
            <span>Total</span>
            <span>{formatCurrency(cart.totalPrice)}</span>
          </div>
        </aside>
      </div>
    </>
  );
}
