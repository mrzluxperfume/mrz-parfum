-- Trigger automatique pour envoyer des emails lors de nouvelles commandes
-- À exécuter dans Supabase SQL Editor

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

-- 2. Fonction pour appeler le webhook Netlify qui enverra les emails
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_url text;
  payload jsonb;
  http_response record;
BEGIN
  -- URL du webhook Netlify (à configurer via variable d'environnement ou directement)
  -- Vous devrez remplacer cette URL par votre URL Netlify
  webhook_url := current_setting('app.settings.order_webhook_url', true);
  
  -- Si pas de webhook configuré, on utilise une URL par défaut
  IF webhook_url IS NULL OR webhook_url = '' THEN
    webhook_url := 'https://www.mrz-perfume.fr/.netlify/functions/order-notification';
  END IF;

  -- Construire le payload avec toutes les infos de la commande
  payload := jsonb_build_object(
    'order_id', NEW.id,
    'customer', NEW.customer,
    'items', NEW.items,
    'total', NEW.total,
    'note', NEW.note,
    'created_at', NEW.created_at,
    'status', NEW.status
  );

  -- Insérer dans la table de tracking (évite les doublons)
  INSERT INTO public.order_email_notifications (order_id)
  VALUES (NEW.id)
  ON CONFLICT (order_id) DO NOTHING;

  -- Appeler le webhook en arrière-plan avec pg_net (si disponible)
  -- Sinon utiliser http extension
  BEGIN
    -- Tentative avec pg_net (recommandé pour Supabase)
    PERFORM net.http_post(
      url := webhook_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Supabase-Event', 'order.created'
      ),
      body := payload
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Si pg_net n'est pas disponible, logger l'erreur
      RAISE WARNING 'Webhook notification failed for order %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 3. Créer le trigger qui se déclenche à chaque INSERT dans orders
DROP TRIGGER IF EXISTS on_order_created ON public.orders;
CREATE TRIGGER on_order_created
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_order();

-- 4. Activer l'extension pg_net si disponible (pour Supabase)
-- Cette extension permet de faire des requêtes HTTP asynchrones
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 5. Configuration de l'URL du webhook (optionnel, à personnaliser)
-- Vous pouvez changer cette URL dans Supabase Dashboard > Database > Settings
-- ALTER DATABASE postgres SET app.settings.order_webhook_url = 'https://www.mrz-perfume.fr/.netlify/functions/order-notification';

COMMENT ON FUNCTION public.notify_new_order() IS 
'Trigger function that sends webhook notification when a new order is created';

COMMENT ON TABLE public.order_email_notifications IS 
'Tracks email notifications sent for orders to prevent duplicates';
