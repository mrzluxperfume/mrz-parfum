-- Migration: les emails de commande sont envoyés par le webhook Stripe.
-- Retire l'ancien trigger afin d'éviter les emails en double.

-- 1. Table pour tracker les notifications envoyées
CREATE TABLE IF NOT EXISTS public.order_email_notifications (
  order_id text PRIMARY KEY REFERENCES public.orders(id) ON DELETE CASCADE,
  merchant_notified_at timestamptz,
  customer_notified_at timestamptz,
  merchant_error text,
  customer_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_email_notifications ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS on_order_created ON public.orders;
DROP FUNCTION IF EXISTS public.notify_new_order();

COMMENT ON TABLE public.order_email_notifications IS
'Historique des notifications de commande issues de l’ancien trigger Supabase.';
