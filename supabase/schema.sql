create extension if not exists pgcrypto;
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  address text not null,
  city text not null,
  country text not null,
  total numeric(10,2) not null check (total >= 0),
  items jsonb not null,
  payment_method text not null default 'pay_on_delivery' check (payment_method in ('pay_on_delivery', 'not_recorded')),
  account_email text,
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;
revoke all on public.orders from anon, authenticated;
grant select, insert, update, delete on public.orders to service_role;
create index if not exists orders_account_email_created_at_idx on public.orders (account_email, created_at desc);

create table if not exists public.carts (
  account_email text primary key,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.carts enable row level security;
revoke all on public.carts from anon, authenticated;
grant select, insert, update, delete on public.carts to service_role;

create table if not exists public.profiles (
  email text primary key,
  display_name text not null check (char_length(display_name) between 1 and 80),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select, insert, update, delete on public.profiles to service_role;
