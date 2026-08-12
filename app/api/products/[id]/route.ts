import { type NextRequest } from "next/server";
import { fail, handleApiError, ok, requireAdminProfile } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { UpdateProductSchema } from "@/lib/validations/schemas";
import type { Product } from "@/types";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdminProfile();

    if (!admin) {
      return fail("FORBIDDEN", 403);
    }

    const payload = UpdateProductSchema.parse(await request.json());
    const { data, error } = await supabaseAdmin
      .from("products")
      .update(payload)
      .eq("id", params.id)
      .select("id,slug,title,description,short_description,price,compare_at_price,category,tags,image_url,file_path,image_urls,file_paths,stock_quantity,reserved_quantity,status,metadata,created_at,updated_at")
      .single<Product>();

    if (error) {
      throw error;
    }

    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdminProfile();

    if (!admin) {
      return fail("FORBIDDEN", 403);
    }

    await supabaseAdmin.from("products").update({ status: "archived" }).eq("id", params.id);
    return ok({ archived: true });
  } catch (error) {
    return handleApiError(error);
  }
}
