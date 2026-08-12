import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export async function getCurrentProfile() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,created_at,updated_at")
    .eq("id", user.id)
    .single<Profile>();

  return data;
}

export async function requireAdminPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?redirect=/admin");
  }

  if (profile.role !== "admin") {
    redirect("/");
  }

  return profile;
}
