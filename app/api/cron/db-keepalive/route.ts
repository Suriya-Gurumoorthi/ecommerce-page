import { type NextRequest } from "next/server";
import { fail, handleApiError, ok, requireCron } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    if (!requireCron(request)) {
      return fail("UNAUTHORIZED", 401);
    }

    const { error } = await supabaseAdmin.from("products").select("id").limit(1);

    if (error) {
      throw error;
    }

    return ok({ pinged: true, timestamp: new Date().toISOString() });
  } catch (error) {
    return handleApiError(error);
  }
}
