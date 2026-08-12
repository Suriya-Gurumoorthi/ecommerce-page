alter table public.downloads add constraint downloads_order_item_unique unique (order_item_id);

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('digital-products', 'digital-products', false, 104857600),
  ('product-images', 'product-images', true, 10485760)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

create policy "Public product images are readable"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "Admins can manage product images"
on storage.objects for all
using (
  bucket_id = 'product-images' and
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
)
with check (
  bucket_id = 'product-images' and
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Admins can manage digital products"
on storage.objects for all
using (
  bucket_id = 'digital-products' and
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
)
with check (
  bucket_id = 'digital-products' and
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
