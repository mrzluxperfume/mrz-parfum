# Commandes et emails automatiques

## Fonctionnement

Après un paiement Stripe confirmé, la fonction Netlify `stripe-webhook` :

1. vérifie la signature Stripe et le statut payé ;
2. réserve un numéro `MR12345` ;
3. enregistre la commande dans `public.orders` avec les données de la session Stripe ;
4. envoie un email au propriétaire et une confirmation au client.

La page de retour Stripe appelle aussi `/api/checkout/confirm`. Cette fonction enregistre la commande de façon idempotente et retourne le numéro à afficher. Le webhook reste le mécanisme de secours si le client ferme la page après le paiement.

Les emails sont déclenchés côté serveur lors de la confirmation de la commande et également par le webhook Stripe en secours. `stripe_order_email_deliveries`, indexée par session Stripe, évite qu'un webhook renvoyé ou une seconde confirmation expédie les mêmes emails une deuxième fois. L'interface admin ne doit pas être ouverte pour recevoir les notifications.

## Configuration requise

Dans **Netlify > Site configuration > Environment variables**, renseignez :

- `STRIPE_SECRET_KEY` : clé secrète du mode utilisé (`sk_test_...` ou `sk_live_...`)
- `STRIPE_WEBHOOK_SECRET` : signature (`whsec_...`) du webhook du même mode
- `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`
- `SMTP_USER`, `SMTP_PASS`, `SMTP_HOST`, `SMTP_PORT`
- Les notifications de nouvelle commande sont toujours envoyées à `mrz.lux.perfume@gmail.com`.
- L'email de confirmation client est envoyé à l'adresse fournie par le client dans Stripe Checkout.

Les clés Stripe et Supabase secrètes doivent rester côté serveur, sans préfixe `VITE_`.

Dans Stripe, configurez l’endpoint :

`https://<votre-domaine>/.netlify/functions/stripe-webhook`

Événements à écouter :

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

Utilisez un endpoint et un secret distincts pour le mode test et le mode réel.

## Migration Supabase

Vérifiez que `orders`, `order_number_registry`, `stripe_order_email_notifications`, `stripe_order_email_deliveries` et la fonction `get_or_create_order_number` ont été créées. Le schéma des tables Stripe se trouve dans `supabase/stripe-order-email-notifications.sql`.

Si l’ancien trigger d’emails a été activé, exécutez `supabase/order-notification-trigger.sql` dans le SQL Editor Supabase. Ce script retire l’ancien trigger, car les emails sont désormais envoyés par le webhook Stripe et non par un trigger de base de données.

## Vérification après déploiement

1. Faites un paiement en mode test.
2. Vérifiez que le client voit un numéro au format `MR12345`.
3. Vérifiez la ligne correspondante dans `public.orders`.
4. Dans Netlify, consultez les logs de `stripe-webhook` pour les erreurs d’enregistrement ou SMTP.
5. Vérifiez `public.stripe_order_email_deliveries` : les deux colonnes de statut doivent être `sent`. Si l'une est `failed`, consultez `merchant_email_error` ou `customer_email_error` et les logs Netlify, corrigez la configuration puis renvoyez l'événement Stripe.

Si la commande est visible dans Supabase mais pas dans l’admin, consultez l’erreur affichée en haut de la page **Commandes** et vérifiez les politiques de lecture RLS de `public.orders`.
