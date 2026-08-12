-- Core database functions & triggers.
--
-- Reconstructed from the application code that depends on them:
--   * reserve_product_stock            -> app/api/checkout/route.ts
--   * release_expired_stock_reservations -> app/api/cron/release-stock/route.ts
--   * order_number generation          -> orders are inserted with order_number ""
--   * handle_new_user (profile row)    -> nothing else creates public.profiles rows
--
-- Everything here is idempotent (create or replace / if not exists / drop if
-- exists), so applying it against a database where these objects already exist
-- simply re-syncs the definitions without touching existing rows.

-- ---------------------------------------------------------------------------
-- 1. Order number generation
-- ---------------------------------------------------------------------------
-- orders.order_number is `unique not null` with no default, and the checkout
-- route inserts an empty string and reads the value back. A BEFORE INSERT
-- trigger fills it with a human-readable, collision-free number.
-- A sequence guarantees uniqueness even for many orders on the same day.

create sequence if not exists public.order_number_seq;

create or replace function public.set_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'ORD-'
      || to_char(now(), 'YYYYMMDD')
      || '-'
      || lpad(nextval('public.order_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists set_order_number on public.orders;
create trigger set_order_number
  before insert on public.orders
  for each row
  execute function public.set_order_number();

-- ---------------------------------------------------------------------------
-- 2. New-user profile provisioning
-- ---------------------------------------------------------------------------
-- Every auth.users row needs a matching public.profiles row: orders.user_id is
-- a FK to profiles(id), so checkout would fail with a foreign-key violation for
-- any user who never got a profile. Runs as SECURITY DEFINER because the signup
-- happens in the auth schema and must write into public.profiles.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Backfill: create profiles for any existing auth users that are missing one
-- (e.g. accounts created while this trigger was absent).
insert into public.profiles (id, email, full_name)
select u.id, coalesce(u.email, ''), nullif(u.raw_user_meta_data ->> 'full_name', '')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Stock reservation
-- ---------------------------------------------------------------------------
-- Called once per line item during checkout. Increments reserved_quantity so
-- productAvailableQuantity() (stock_quantity - reserved_quantity) reflects
-- in-flight orders and prevents overselling. Unlimited-stock products
-- (stock_quantity = -1) are left untouched. The row is locked FOR UPDATE to
-- keep concurrent checkouts from racing on the same product.

create or replace function public.reserve_product_stock(
  product_id_input uuid,
  quantity_input integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_stock integer;
begin
  select stock_quantity into current_stock
  from public.products
  where id = product_id_input
  for update;

  if not found then
    raise exception 'Product % not found', product_id_input;
  end if;

  -- Only track reservations for finite-stock products.
  if current_stock <> -1 then
    update public.products
    set reserved_quantity = reserved_quantity + quantity_input
    where id = product_id_input;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Release expired stock reservations
-- ---------------------------------------------------------------------------
-- Invoked by the every-5-minutes cron. Finds reservations that have expired and
-- were never released, gives the reserved units back to available stock, and
-- marks the reservation released. Orders that already reached 'paid' are skipped
-- so a captured-but-slow payment never has its stock yanked. Returns the number
-- of reservations released (the cron reports this count).

create or replace function public.release_expired_stock_reservations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  released_count integer := 0;
  reservation record;
begin
  for reservation in
    select sr.id, sr.product_id, sr.quantity
    from public.stock_reservations sr
    join public.orders o on o.id = sr.order_id
    where sr.released = false
      and sr.expires_at < now()
      and o.status <> 'paid'
    for update of sr
  loop
    update public.products
    set reserved_quantity = greatest(reserved_quantity - reservation.quantity, 0)
    where id = reservation.product_id
      and stock_quantity <> -1;

    update public.stock_reservations
    set released = true
    where id = reservation.id;

    released_count := released_count + 1;
  end loop;

  return released_count;
end;
$$;
