-- Migration 007 moved every other admin-check policy over to public.is_admin()
-- (a SECURITY DEFINER function) to avoid RLS recursion through public.profiles.
-- The storage.objects policies added in 005 were missed and still use a raw
-- subquery on public.profiles. Align them for consistency and to remove any
-- doubt when diagnosing "new row violates row-level security policy" errors
-- on uploads.

drop policy if exists "Admins can manage product images" on storage.objects;
create policy "Admins can manage product images"
on storage.objects for all
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can manage digital products" on storage.objects;
create policy "Admins can manage digital products"
on storage.objects for all
using (bucket_id = 'digital-products' and public.is_admin())
with check (bucket_id = 'digital-products' and public.is_admin());
