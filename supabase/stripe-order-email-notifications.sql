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

alter table public.stripe_order_email_notifications
  add column if not exists merchant_email_status text not null default 'pending'
  check (merchant_email_status in ('pending', 'processing', 'sent', 'failed'));
alter table public.stripe_order_email_notifications
  add column if not exists customer_email_status text not null default 'pending'
  check (customer_email_status in ('pending', 'processing', 'sent', 'failed'));

update public.stripe_order_email_notifications
set merchant_email_status = 'sent'
where status = 'sent' and merchant_email_status = 'pending';