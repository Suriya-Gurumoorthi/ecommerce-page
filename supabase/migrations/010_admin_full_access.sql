-- Give admins (public.is_admin() = true) full, unrestricted CRUD on every
-- table, not just the ones already covered. Two tables (webhook_events,
-- stock_reservations) previously only let admins SELECT; this widens them
-- to FOR ALL so admins can edit/delete there too, matching every other table.
--
-- Note: RLS only controls *who* can touch a row. It does not relax column
-- CHECK constraints (e.g. orders.status must still be one of the allowed
-- values, profiles.role must still be 'customer' or 'admin'). Admins get
-- full authority within the data's valid shape, not a way to corrupt it.

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can do anything to products" on public.products;
create policy "Admins can do anything to products" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can view all order items" on public.order_items;
create policy "Admins can view all order items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can view all downloads" on public.downloads;
create policy "Admins can view all downloads" on public.downloads for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can view webhook events" on public.webhook_events;
create policy "Admins can manage webhook events" on public.webhook_events for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can view stock reservations" on public.stock_reservations;
create policy "Admins can manage stock reservations" on public.stock_reservations for all using (public.is_admin()) with check (public.is_admin());
