create table if not exists public.stripe_order_email_notifications (
  stripe_event_id text primary key,
  checkout_session_id text not null,
  status text not null check (status in ('processing', 'sent', 'failed')),
  merchant_email_status text not null default 'pending'
    check (merchant_email_status in ('pending', 'processing', 'sent', 'failed')),
  customer_email_status text not null default 'pending'
    check (customer_email_status in ('pending', 'processing', 'sent', 'failed')),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stripe_order_email_notifications enable row level security;

create table if not exists public.stripe_order_email_deliveries (
  checkout_session_id text primary key,
  merchant_email_status text not null default 'pending'
    check (merchant_email_status in ('pending', 'processing', 'sent', 'failed')),
  merchant_email_error text,
  customer_email_status text not null default 'pending'
    check (customer_email_status in ('pending', 'processing', 'sent', 'failed')),
  customer_email_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stripe_order_email_deliveries enable row level security;
alter table public.stripe_order_email_deliveries
  add column if not exists merchant_email_error text;
alter table public.stripe_order_email_deliveries
  add column if not exists customer_email_error text;

create table if not exists public.order_number_registry (
  checkout_session_id text primary key,
  order_number text not null unique
    check (order_number ~ '^MR[0-9]{5}$'),
  created_at timestamptz not null default now()
);

alter table public.order_number_registry enable row level security;

create or replace function public.get_or_create_order_number(
  p_checkout_session_id text
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_existing text;
  v_candidate text;
  v_allocated text;
  v_attempt integer;
begin
  if p_checkout_session_id is null or p_checkout_session_id !~ '^cs_[A-Za-z0-9_]+$' then
    raise exception 'Invalid Stripe Checkout session ID';
  end if;

  select order_number into v_existing
  from public.order_number_registry
  where checkout_session_id = p_checkout_session_id;
  if found then return v_existing; end if;

  for v_attempt in 1..200 loop
    v_candidate := 'MR' || lpad(floor(random() * 100000)::integer::text, 5, '0');
    insert into public.order_number_registry (checkout_session_id, order_number)
    values (p_checkout_session_id, v_candidate)
    on conflict do nothing
    returning order_number into v_allocated;

    if v_allocated is not null then return v_allocated; end if;

    select order_number into v_existing
    from public.order_number_registry
    where checkout_session_id = p_checkout_session_id;
    if found then return v_existing; end if;
  end loop;

  raise exception 'Unable to allocate an order number';
end;
$$;

revoke all on function public.get_or_create_order_number(text)
  from public, anon, authenticated;
grant execute on function public.get_or_create_order_number(text)
  to service_role;

alter table public.stripe_order_email_notifications
  add column if not exists merchant_email_status text not null default 'pending'
  check (merchant_email_status in ('pending', 'processing', 'sent', 'failed'));
alter table public.stripe_order_email_notifications
  add column if not exists customer_email_status text not null default 'pending'
  check (customer_email_status in ('pending', 'processing', 'sent', 'failed'));

update public.stripe_order_email_notifications
set merchant_email_status = 'sent'
where status = 'sent' and merchant_email_status = 'pending';