import { formatCurrency } from "@/lib/utils";

export function PriceDisplay({ price, compareAtPrice }: { price: number; compareAtPrice?: number | null }) {
  const discount = compareAtPrice && compareAtPrice > price ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="whitespace-nowrap text-xl font-bold text-store-text">{formatCurrency(price)}</span>
      {compareAtPrice ? <span className="whitespace-nowrap text-sm text-store-muted line-through">{formatCurrency(compareAtPrice)}</span> : null}
      {discount > 0 ? <span className="whitespace-nowrap rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-400">{discount}% off</span> : null}
    </div>
  );
}
