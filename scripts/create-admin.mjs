import { createClient } from "@supabase/supabase-js";

const [, , email, password, fullName] = process.argv;

if (!email || !password) {
  console.error("Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password> [full name]");
  process.exit(1);
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
  email,
  password,
  email_confirm: true
});

if (createError) {
  console.error("Failed to create user:", createError.message);
  process.exit(1);
}

const userId = created.user.id;

const { error: profileError } = await supabaseAdmin
  .from("profiles")
  .upsert({ id: userId, email, full_name: fullName ?? null, role: "admin" });

if (profileError) {
  console.error("User created but failed to set admin role:", profileError.message);
  process.exit(1);
}

console.log(`Admin user created: ${email} (id: ${userId})`);
