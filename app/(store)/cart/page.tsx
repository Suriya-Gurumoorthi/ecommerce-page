import { CartPageClient } from "@/components/store/CartPageClient";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-12">
      <h1 className="mb-8 font-display text-3xl font-bold">Cart</h1>
      <CartPageClient />
    </div>
  );
}
