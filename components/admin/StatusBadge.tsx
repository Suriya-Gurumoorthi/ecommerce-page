import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800",
  expired: "bg-gray-100 text-gray-800",
  active: "bg-green-100 text-green-800",
  draft: "bg-gray-100 text-gray-800",
  archived: "bg-red-100 text-red-800"
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", styles[status] ?? "bg-gray-100 text-gray-800")}>{status}</span>;
}
