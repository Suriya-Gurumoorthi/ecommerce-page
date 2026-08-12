alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

alter table public.products enable row level security;
create policy "Anyone can view active products" on public.products for select using (status = 'active');
create policy "Admins can do anything to products" on public.products for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

alter table public.orders enable row level security;
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Admins can view all orders" on public.orders for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

alter table public.order_items enable row level security;
create policy "Users can view own order items" on public.order_items for select using (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
);
create policy "Admins can view all order items" on public.order_items for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

alter table public.downloads enable row level security;
create policy "Users can view own downloads" on public.downloads for select using (auth.uid() = user_id);
create policy "Admins can view all downloads" on public.downloads for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

alter table public.webhook_events enable row level security;
alter table public.stock_reservations enable row level security;
create policy "Admins can view webhook events" on public.webhook_events for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can view stock reservations" on public.stock_reservations for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
