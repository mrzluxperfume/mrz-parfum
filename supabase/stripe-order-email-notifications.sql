create table if not exists public.stripe_order_email_notifications (
  stripe_event_id text primary key,
  checkout_session_id text not null,
  status text not null check (status in ('processing', 'sent', 'failed')),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stripe_order_email_notifications enable row level security;