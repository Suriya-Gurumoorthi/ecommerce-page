import { type NextRequest } from "next/server";
import { fail, handleApiError, ok, requireCron } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendDailySummary } from "@/lib/email/resend";
import type { AdminDashboardStats, Order } from "@/types";

export async function GET(request: NextRequest) {
  try {
    if (!requireCron(request)) {
      return fail("UNAUTHORIZED", 401);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("id,total_amount,created_at")
      .eq("status", "paid")
      .gte("created_at", today.toISOString())
      .returns<Array<Pick<Order, "id" | "total_amount" | "created_at">>>();

    const stats: AdminDashboardStats = {
      todayRevenue: (orders ?? []).reduce((sum, order) => sum + order.total_amount, 0),
      todayOrders: orders?.length ?? 0,
      totalOrders: orders?.length ?? 0,
      totalProducts: 0,
      revenueSeries: []
    };

    sendDailySummary(stats);
    return ok(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
