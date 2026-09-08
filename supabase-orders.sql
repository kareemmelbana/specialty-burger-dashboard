-- Specialty Burger: add order capture to the existing dashboard orders table.
-- Run this once in the Supabase SQL editor. It does not create a duplicate table.

create sequence if not exists public.orders_order_number_seq start with 1000;

alter table public.orders add column if not exists order_number bigint;
alter table public.orders add column if not exists table_number text;
alter table public.orders add column if not exists items jsonb not null default '[]'::jsonb;
alter table public.orders add column if not exists total_amount numeric(10,2) not null default 0;
alter table public.orders add column if not exists status text not null default 'new';
alter table public.orders add column if not exists order_type text not null default 'dine_in';
alter table public.orders add column if not exists payment_status text not null default 'pending';
alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists customer_phone text;
alter table public.orders add column if not exists notes text;
alter table public.orders alter column id set default gen_random_uuid();

do $$
begin
  perform setval(
    'public.orders_order_number_seq',
    greatest(coalesce((select max(order_number) from public.orders), 999), 999),
    true
  );
end $$;

update public.orders
set order_number = nextval('public.orders_order_number_seq')
where order_number is null;

alter table public.orders alter column order_number set default nextval('public.orders_order_number_seq');
alter table public.orders alter column order_number set not null;
create unique index if not exists orders_order_number_key on public.orders(order_number);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_status_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders add constraint orders_status_check
      check (status in ('new', 'preparing', 'ready', 'completed', 'cancelled'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_order_type_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders add constraint orders_order_type_check
      check (order_type in ('dine_in'));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_payment_status_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders add constraint orders_payment_status_check
      check (payment_status in ('pending', 'paid', 'failed', 'refunded'));
  end if;
end $$;

alter table public.orders enable row level security;

drop policy if exists "public can create new orders" on public.orders;
create policy "public can create new orders"
  on public.orders for insert
  to anon, authenticated
  with check (status = 'new');

drop policy if exists "authenticated can view orders" on public.orders;
create policy "authenticated can view orders"
  on public.orders for select
  to authenticated
  using (true);

drop policy if exists "authenticated can update orders" on public.orders;
create policy "authenticated can update orders"
  on public.orders for update
  to authenticated
  using (true)
  with check (status in ('new', 'preparing', 'ready', 'completed', 'cancelled'));

-- The public site uses this function so it can receive only the generated
-- order number without a public SELECT policy over all restaurant orders.
create or replace function public.create_public_order(
  p_table_number text,
  p_items jsonb,
  p_total_amount numeric
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  created_order_number bigint;
  calculated_total numeric(10,2);
begin
  if nullif(trim(p_table_number), '') is null then
    raise exception 'table number is required';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'order items are required';
  end if;
  select round(coalesce(sum(
    coalesce((item->>'quantity')::numeric, 0) * coalesce((item->>'unit_price')::numeric, 0)
    + coalesce((
      select sum(coalesce((addon->>'quantity')::numeric, 1) * coalesce((addon->>'price')::numeric, 0))
      from jsonb_array_elements(coalesce(item->'addons', '[]'::jsonb)) as addon
    ), 0)
  ), 0), 2)
  into calculated_total
  from jsonb_array_elements(p_items) as item;

  if p_total_amount is null or round(p_total_amount, 2) <> calculated_total then
    raise exception 'total amount does not match order items';
  end if;

  insert into public.orders (
    table_number, items, total_amount, status, order_type, payment_status,
    customer_name, customer_phone, notes
  )
  values (
    trim(p_table_number), p_items, calculated_total, 'new', 'dine_in', 'pending',
    null, null, null
  )
  returning order_number into created_order_number;

  return created_order_number;
end;
$$;

revoke all on function public.create_public_order(text, jsonb, numeric) from public;
grant execute on function public.create_public_order(text, jsonb, numeric) to anon, authenticated;
