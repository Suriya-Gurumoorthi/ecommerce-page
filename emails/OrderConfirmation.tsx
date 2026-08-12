import { Button, Hr, Text } from "@react-email/components";
import { EmailShell } from "@/emails/EmailShell";
import { formatCurrency } from "@/lib/utils";
import type { Order, OrderItem } from "@/types";

export function OrderConfirmationEmail({ order, items, downloadUrl }: { order: Order; items: OrderItem[]; downloadUrl: string }) {
  return (
    <EmailShell preview={`Your order #${order.order_number} is confirmed`} title="Order confirmed">
      <Text style={{ color: "#F0EEE8" }}>Thanks {order.customer_name ?? "there"}, your payment is confirmed.</Text>
      {items.map((item) => (
        <Text key={item.id} style={{ color: "#F0EEE8" }}>
          {item.product_title} × {item.quantity} — {formatCurrency(item.total_price)}
        </Text>
      ))}
      <Hr style={{ borderColor: "#252A35" }} />
      <Text style={{ color: "#F5C842", fontWeight: 700 }}>Total paid: {formatCurrency(order.total_amount)}</Text>
      <Button href={downloadUrl} style={{ backgroundColor: "#F5C842", color: "#0D0F14", borderRadius: 10, padding: "12px 18px", fontWeight: 700 }}>
        View downloads
      </Button>
    </EmailShell>
  );
}

export default OrderConfirmationEmail;
