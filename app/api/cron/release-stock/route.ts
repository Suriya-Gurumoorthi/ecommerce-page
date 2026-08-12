import { type NextRequest } from "next/server";
import { fail, handleApiError, ok, requireCron } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    if (!requireCron(request)) {
      return fail("UNAUTHORIZED", 401);
    }

    const { data, error } = await supabaseAdmin.rpc("release_expired_stock_reservations");

    if (error) {
      throw error;
    }

    return ok({ released: Number(data ?? 0) });
  } catch (error) {
    return handleApiError(error);
  }
}
