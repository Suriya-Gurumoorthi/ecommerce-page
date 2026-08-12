import { productAvailableQuantity } from "@/lib/utils";

export function StockBadge({ stockQuantity, reservedQuantity }: { stockQuantity: number; reservedQuantity: number }) {
  const available = productAvailableQuantity({ stock_quantity: stockQuantity, reserved_quantity: reservedQuantity });

  if (available === Number.POSITIVE_INFINITY) {
    return <span className="text-sm text-green-400">In Stock</span>;
  }

  if (available <= 0) {
    return <span className="text-sm text-red-400">Out of Stock</span>;
  }

  if (available <= 3) {
    return <span className="text-sm text-amber-400">Only {available} left</span>;
  }

  return <span className="text-sm text-green-400">In Stock</span>;
}
