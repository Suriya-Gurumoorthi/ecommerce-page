-- Support multiple cover images and multiple PDF files per product.
-- Arrays become the source of truth; the legacy singular columns
-- (image_url, file_path) are kept in sync with the first array element so
-- every existing consumer (storefront cover image, legacy download links)
-- keeps working without changes.

alter table public.products
  add column if not exists image_urls text[] not null default '{}',
  add column if not exists file_paths text[] not null default '{}';

-- Backfill arrays from the existing singular columns.
update public.products
  set image_urls = array[image_url]
  where image_url is not null and image_url <> '' and coalesce(array_length(image_urls, 1), 0) = 0;

update public.products
  set file_paths = array[file_path]
  where file_path is not null and file_path <> '' and coalesce(array_length(file_paths, 1), 0) = 0;

-- Keep the singular columns pointing at the first array element.
create or replace function public.sync_primary_media()
returns trigger as $$
begin
  new.image_url := case when coalesce(array_length(new.image_urls, 1), 0) >= 1 then new.image_urls[1] else null end;
  new.file_path := case when coalesce(array_length(new.file_paths, 1), 0) >= 1 then new.file_paths[1] else null end;
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_sync_primary_media on public.products;
create trigger products_sync_primary_media
  before insert or update on public.products
  for each row execute function public.sync_primary_media();
