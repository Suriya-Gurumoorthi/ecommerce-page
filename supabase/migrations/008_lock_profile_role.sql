-- "Users can update own profile" (003_rls.sql) has no column-level restriction,
-- so any authenticated user can currently self-promote via:
--   supabase.from("profiles").update({ role: "admin" }).eq("id", auth.uid())
-- Lock the role column so only admins (via is_admin(), which bypasses RLS
-- through SECURITY DEFINER) or the service role can change it.

create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists lock_profile_role on public.profiles;
create trigger lock_profile_role
  before update on public.profiles
  for each row
  execute function public.prevent_role_self_escalation();
