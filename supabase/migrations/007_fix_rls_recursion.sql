-- The admin RLS policies checked admin status via a subquery on public.profiles,
-- but profiles' own admin policy does the same subquery on itself, causing
-- Postgres to detect infinite recursion (42P17) on every query that touches
-- these tables, including anonymous reads of products.
-- Fix: check admin status through a SECURITY DEFINER function, which runs
-- with elevated privileges and bypasses RLS on the inner lookup.

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles for all using (public.is_admin());

drop policy if exists "Admins can do anything to products" on public.products;
create policy "Admins can do anything to products" on public.products for all using (public.is_admin());

drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders" on public.orders for all using (public.is_admin());

drop policy if exists "Admins can view all order items" on public.order_items;
create policy "Admins can view all order items" on public.order_items for all using (public.is_admin());

drop policy if exists "Admins can view all downloads" on public.downloads;
create policy "Admins can view all downloads" on public.downloads for all using (public.is_admin());

drop policy if exists "Admins can view webhook events" on public.webhook_events;
create policy "Admins can view webhook events" on public.webhook_events for select using (public.is_admin());

drop policy if exists "Admins can view stock reservations" on public.stock_reservations;
create policy "Admins can view stock reservations" on public.stock_reservations for select using (public.is_admin());
