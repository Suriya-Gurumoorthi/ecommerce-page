import { Hr, Text } from "@react-email/components";
import { EmailShell } from "@/emails/EmailShell";
import { formatCurrency } from "@/lib/utils";
import type { Order, OrderItem } from "@/types";

export function NewOrderMerchantEmail({ order, items, adminUrl }: { order: Order; items: OrderItem[]; adminUrl: string }) {
  return (
    <EmailShell preview={`New order #${order.order_number}`} title="New order received">
      <Text style={{ color: "#F0EEE8" }}>
        {order.customer_name ?? "Customer"} ({order.customer_email})
      </Text>
      {items.map((item) => (
        <Text key={item.id} style={{ color: "#F0EEE8" }}>
          {item.product_title} × {item.quantity}
        </Text>
      ))}
      <Hr style={{ borderColor: "#252A35" }} />
      <Text style={{ color: "#F5C842" }}>Total: {formatCurrency(order.total_amount)}</Text>
      <Text style={{ color: "#8B8F9E" }}>Admin: {adminUrl}</Text>
    </EmailShell>
  );
}

export default NewOrderMerchantEmail;
