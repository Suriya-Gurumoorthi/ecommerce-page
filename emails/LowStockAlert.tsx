import { Text } from "@react-email/components";
import { EmailShell } from "@/emails/EmailShell";
import type { Product } from "@/types";

export function LowStockAlertEmail({ product, adminUrl }: { product: Product; adminUrl: string }) {
  return (
    <EmailShell preview={`Low stock alert — ${product.title}`} title="Low stock alert">
      <Text style={{ color: "#F0EEE8" }}>{product.title} has {product.stock_quantity} units left.</Text>
      <Text style={{ color: "#8B8F9E" }}>Update product: {adminUrl}</Text>
    </EmailShell>
  );
}

export default LowStockAlertEmail;
