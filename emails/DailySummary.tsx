import { Text } from "@react-email/components";
import { EmailShell } from "@/emails/EmailShell";
import { formatCurrency } from "@/lib/utils";
import type { AdminDashboardStats } from "@/types";

export function DailySummaryEmail({ stats, adminUrl }: { stats: AdminDashboardStats; adminUrl: string }) {
  return (
    <EmailShell preview="Daily sales summary" title="Daily sales summary">
      <Text style={{ color: "#F0EEE8" }}>Orders today: {stats.todayOrders}</Text>
      <Text style={{ color: "#F0EEE8" }}>Revenue today: {formatCurrency(stats.todayRevenue)}</Text>
      <Text style={{ color: "#8B8F9E" }}>Dashboard: {adminUrl}</Text>
    </EmailShell>
  );
}

export default DailySummaryEmail;
