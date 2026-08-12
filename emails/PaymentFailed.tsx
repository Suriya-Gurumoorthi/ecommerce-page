import { Button, Text } from "@react-email/components";
import { EmailShell } from "@/emails/EmailShell";
import type { Order } from "@/types";

export function PaymentFailedEmail({ order, retryUrl }: { order: Order; retryUrl: string }) {
  return (
    <EmailShell preview={`Payment failed for order #${order.order_number}`} title="Payment failed">
      <Text style={{ color: "#F0EEE8" }}>Your payment did not go through. No amount has been captured for this order.</Text>
      <Button href={retryUrl} style={{ backgroundColor: "#F5C842", color: "#0D0F14", borderRadius: 10, padding: "12px 18px", fontWeight: 700 }}>
        Retry checkout
      </Button>
    </EmailShell>
  );
}

export default PaymentFailedEmail;
