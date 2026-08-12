create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  description text not null,
  short_description text not null,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2),
  category text not null,
  tags text[] default '{}',
  image_url text,
  file_path text,
  stock_quantity integer not null default -1,
  reserved_quantity integer not null default 0,
  status text not null default 'draft' check (status in ('active', 'draft', 'archived')),
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,
  user_id uuid references public.profiles(id) on delete set null,
  customer_email text not null,
  customer_name text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded', 'expired')),
  total_amount numeric(10,2) not null,
  currency text not null default 'INR',
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  razorpay_signature text,
  payment_method text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  expires_at timestamptz default now() + interval '30 minutes'
);

create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_title text not null,
  product_slug text not null,
  quantity integer not null default 1,
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create table public.downloads (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  order_item_id uuid references public.order_items(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  download_count integer not null default 0,
  max_downloads integer not null default 5,
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz not null default now() + interval '7 days',
  last_downloaded_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.webhook_events (
  id uuid primary key default uuid_generate_v4(),
  provider text not null,
  event_id text not null,
  event_type text not null,
  payload jsonb not null,
  processed boolean not null default false,
  error text,
  created_at timestamptz not null default now(),
  unique(provider, event_id)
);

create table public.stock_reservations (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity integer not null,
  expires_at timestamptz not null default now() + interval '30 minutes',
  released boolean not null default false,
  created_at timestamptz not null default now()
);
