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
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;
revoke all on public.orders from anon, authenticated;
grant insert on public.orders to service_role;
