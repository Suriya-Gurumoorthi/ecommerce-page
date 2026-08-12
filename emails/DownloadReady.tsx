import { Button, Text } from "@react-email/components";
import { EmailShell } from "@/emails/EmailShell";
import type { Order } from "@/types";

export function DownloadReadyEmail({ order, downloadUrl }: { order: Order; downloadUrl: string }) {
  return (
    <EmailShell preview={`Your download is ready — #${order.order_number}`} title="Your download is ready">
      <Text style={{ color: "#F0EEE8" }}>Your order is ready. Log in to access secure download links.</Text>
      <Button href={downloadUrl} style={{ backgroundColor: "#F5C842", color: "#0D0F14", borderRadius: 10, padding: "14px 20px", fontWeight: 700 }}>
        Download now
      </Button>
    </EmailShell>
  );
}

export default DownloadReadyEmail;
