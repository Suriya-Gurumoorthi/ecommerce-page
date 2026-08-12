import { type NextRequest } from "next/server";
import { fail, handleApiError, ok, requireAdminProfile, requireUser } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import type { OrderWithItems } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    if (!user) {
      return fail("UNAUTHORIZED", 401);
    }

    const url = new URL(request.url);
    const admin = await requireAdminProfile();
    const status = url.searchParams.get("status");
    const supabase = createClient();

    let query = supabase
      .from("orders")
      .select("id,order_number,user_id,customer_email,customer_name,status,total_amount,currency,razorpay_order_id,razorpay_payment_id,razorpay_signature,payment_method,notes,created_at,updated_at,paid_at,expires_at,order_items(id,order_id,product_id,product_title,product_slug,quantity,unit_price,total_price,created_at)")
      .order("created_at", { ascending: false });

    if (!admin) {
      query = query.eq("user_id", user.id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.returns<OrderWithItems[]>();

    if (error) {
      throw error;
    }

    return ok(data ?? []);
  } catch (error) {
    return handleApiError(error);
  }
}
