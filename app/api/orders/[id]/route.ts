import { type NextRequest } from "next/server";
import { fail, handleApiError, ok, requireAdminProfile } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { OrderStatus } from "@/types";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdminProfile();

    if (!admin) {
      return fail("FORBIDDEN", 403);
    }

    const payload = (await request.json()) as { status?: OrderStatus; notes?: string };
    const update: { status?: OrderStatus; notes?: string } = {};

    if (payload.status) {
      update.status = payload.status;
    }

    if (typeof payload.notes === "string") {
      update.notes = payload.notes;
    }

    await supabaseAdmin.from("orders").update(update).eq("id", params.id);
    return ok({ updated: true });
  } catch (error) {
    return handleApiError(error);
  }
}
