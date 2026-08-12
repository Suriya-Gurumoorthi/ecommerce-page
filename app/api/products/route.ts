import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CreateProductSchema } from "@/lib/validations/schemas";
import { fail, handleApiError, ok, requireAdminProfile } from "@/lib/api";
import type { Product } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("q");

    let query = createClient()
      .from("products")
      .select("id,slug,title,description,short_description,price,compare_at_price,category,tags,image_url,image_urls,stock_quantity,reserved_quantity,status,metadata,created_at,updated_at")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data, error } = await query.returns<Array<Omit<Product, "file_path" | "file_paths">>>();

    if (error) {
      throw error;
    }

    // file_path / file_paths point at private storage objects; never expose them
    // via the public listing API. Downloads are only issued post-purchase.
    return ok((data ?? []).map((product) => ({ ...product, file_path: null, file_paths: [] })));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminProfile();

    if (!admin) {
      return fail("FORBIDDEN", 403);
    }

    const payload = CreateProductSchema.parse(await request.json());
    const { data, error } = await supabaseAdmin
      .from("products")
      .insert(payload)
      .select("id,slug,title,description,short_description,price,compare_at_price,category,tags,image_url,file_path,image_urls,file_paths,stock_quantity,reserved_quantity,status,metadata,created_at,updated_at")
      .single<Product>();

    if (error) {
      throw error;
    }

    return ok(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
