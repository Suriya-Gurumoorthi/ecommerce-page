import { NextResponse, type NextRequest } from "next/server";
import { fail, handleApiError, requireUser } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Download, Order } from "@/types";

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const user = await requireUser();

    if (!user) {
      return fail("UNAUTHORIZED", 401);
    }

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id,order_number,user_id,customer_email,customer_name,status,total_amount,currency,razorpay_order_id,razorpay_payment_id,razorpay_signature,payment_method,notes,created_at,updated_at,paid_at,expires_at")
      .eq("id", params.orderId)
      .eq("user_id", user.id)
      .single<Order>();

    if (!order || order.status !== "paid") {
      return fail("NOT_FOUND", 404);
    }

    // Resolve which order item + which file within that item's product to serve.
    // `item`/`i` target a specific PDF (combo offers have several); when absent we
    // fall back to the first available file so legacy links keep working.
    const url = new URL(request.url);
    const requestedItem = url.searchParams.get("item");
    const requestedIndex = Number(url.searchParams.get("i") ?? "0");

    const downloadQuery = supabaseAdmin
      .from("downloads")
      .select("id,order_id,order_item_id,user_id,product_id,download_count,max_downloads,token,expires_at,last_downloaded_at,created_at")
      .eq("order_id", order.id)
      .eq("user_id", user.id);

    if (requestedItem) {
      downloadQuery.eq("order_item_id", requestedItem);
    }

    const { data: download } = await downloadQuery.limit(1).single<Download>();

    if (!download) {
      return fail("NOT_FOUND", 404);
    }

    if (new Date(download.expires_at).getTime() < Date.now()) {
      return fail("DOWNLOAD_EXPIRED", 410);
    }

    if (download.download_count >= download.max_downloads) {
      return fail("DOWNLOAD_LIMIT_REACHED", 403);
    }

    const { data: product } = await supabaseAdmin
      .from("products")
      .select("file_path,file_paths")
      .eq("id", download.product_id)
      .single<{ file_path: string | null; file_paths: string[] | null }>();

    const files = product?.file_paths?.length ? product.file_paths : product?.file_path ? [product.file_path] : [];
    const targetPath = files[Number.isInteger(requestedIndex) && requestedIndex >= 0 ? requestedIndex : 0];

    if (!targetPath) {
      return fail("FILE_NOT_FOUND", 404);
    }

    const { data: signedUrl, error } = await supabaseAdmin.storage.from("digital-products").createSignedUrl(targetPath, 3600);

    if (error || !signedUrl) {
      throw error ?? new Error("SIGNED_URL_FAILED");
    }

    await supabaseAdmin
      .from("downloads")
      .update({ download_count: download.download_count + 1, last_downloaded_at: new Date().toISOString() })
      .eq("id", download.id);

    return NextResponse.redirect(signedUrl.signedUrl);
  } catch (error) {
    return handleApiError(error);
  }
}
