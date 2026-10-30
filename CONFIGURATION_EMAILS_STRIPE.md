# Configuration des Notifications Email et Webhooks Stripe

## Vue d'ensemble

Le système MRZ Perfume gère maintenant automatiquement les notifications email suivantes :

1. **Email au propriétaire** : Notification instantanée lors d'un paiement Stripe réussi
2. **Email au client** : Confirmation automatique de commande après paiement
3. **Email de confirmation admin** : Email manuel depuis l'interface admin au client

---

## 1. Configuration des Variables d'Environnement

### Variables SMTP requises (Netlify)

Ajoutez ces variables dans **Netlify > Site settings > Environment variables** :

```
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application-gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
MAIL_TO=votre-email@gmail.com
```

### Variables Stripe requises

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Variables Supabase requises

```
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
VITE_SUPABASE_URL=https://votre-projet.supabase.co
```

---

## 2. Configuration Gmail pour l'envoi d'emails

### Étapes pour générer un mot de passe d'application Gmail :

1. Connectez-vous à votre compte Google
2. Allez sur https://myaccount.google.com/security
3. Activez la **validation en deux étapes** (si ce n'est pas déjà fait)
4. Allez dans **Mots de passe des applications**
5. Sélectionnez "Autre" et nommez-le "MRZ Perfume"
6. Copiez le mot de passe généré (16 caractères)
7. Utilisez ce mot de passe pour la variable `SMTP_PASS`

**Important** : N'utilisez jamais votre mot de passe Gmail normal pour `SMTP_PASS`.

---

## 3. Configuration des Webhooks Stripe

### Créer un webhook Stripe

1. Connectez-vous à votre **Stripe Dashboard**
2. Allez dans **Developers > Webhooks**
3. Cliquez sur **Add endpoint**
4. Configurez :
   - **URL du webhook** : `https://www.mrz-perfume.fr/.netlify/functions/stripe-webhook`
   - **Description** : "Notifications email commandes MRZ"
   - **Version API** : Dernière version
   - **Événements à écouter** :
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`

5. Cliquez sur **Add endpoint**
6. Copiez le **Signing secret** (commence par `whsec_`)
7. Ajoutez-le dans Netlify comme variable `STRIPE_WEBHOOK_SECRET`

### Mode test vs Mode production

Pour tester en développement :

1. Créez un webhook de test avec l'URL : `https://votre-site-test.netlify.app/.netlify/functions/stripe-webhook`
2. Utilisez les clés de test Stripe (`sk_test_...`)
3. Utilisez le signing secret du webhook de test

Pour la production :

1. Créez un webhook de production avec l'URL finale
2. Utilisez les clés live Stripe (`sk_live_...`)
3. Utilisez le signing secret du webhook de production

---

## 4. Flux des Notifications Email

### A. Lors d'un paiement réussi (Automatique via Webhook Stripe)

```
1. Client paie sur Stripe
   ↓
2. Stripe envoie un webhook à votre site
   ↓
3. Le webhook génère un numéro de commande (ex: MR12345)
   ↓
4. Deux emails sont envoyés automatiquement :
   - Email au propriétaire (MAIL_TO) avec détails de commande
   - Email au client avec confirmation de paiement
```

**Fichiers concernés** :
- `client/netlify/functions/stripe-webhook.cjs` : Réception webhook
- `client/netlify/functions/mail.mjs` : Fonctions d'envoi email
  - `sendOrderNotification()` : Email au propriétaire
  - `sendCustomerOrderConfirmation()` : Email au client

### B. Depuis l'interface Admin (Manuel)

```
1. Admin ouvre une commande dans le panel
   ↓
2. Admin clique sur "Envoyer confirmation au client"
   ↓
3. Email de confirmation envoyé au client
```

**Fichiers concernés** :
- `client/src/pages/admin/AdminOrdersPage.jsx` : Interface admin
- `client/netlify/functions/admin-send-confirmation.mjs` : Endpoint API
- `client/netlify/functions/mail.mjs` : `sendAdminOrderConfirmation()`

---

## 5. Structure de la Base de Données

### Tables créées automatiquement

```sql
-- Table pour éviter les doublons d'email
CREATE TABLE stripe_order_email_notifications (
  stripe_event_id text PRIMARY KEY,
  checkout_session_id text NOT NULL,
  status text NOT NULL,
  merchant_email_status text NOT NULL DEFAULT 'pending',
  customer_email_status text NOT NULL DEFAULT 'pending',
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table pour les numéros de commande uniques
CREATE TABLE order_number_registry (
  checkout_session_id text PRIMARY KEY,
  order_number text NOT NULL UNIQUE CHECK (order_number ~ '^MR[0-9]{5}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);
```

Ces tables sont créées via le fichier :
`supabase/stripe-order-email-notifications.sql`

---

## 6. Numérotation des Commandes

Le système génère automatiquement des numéros de commande au format **MR12345** :

- Préfixe : `MR`
- 5 chiffres aléatoires : `00000` à `99999`
- Exemples : `MR00123`, `MR45678`, `MR99999`

Le numéro est :
1. Généré lors de la création de la session Stripe
2. Stocké dans les métadonnées Stripe
3. Utilisé dans tous les emails
4. Affiché au client sur la page de confirmation

---

## 7. Test du Système

### Tester les emails en local

1. Configurez les variables d'environnement dans `.env` à la racine du projet
2. Lancez Netlify Dev :
   ```bash
   cd mrz-perfume
   netlify dev
   ```
3. Testez une commande de test

### Tester avec Stripe CLI

```bash
# Installer Stripe CLI
# Forwarding des webhooks en local
stripe listen --forward-to http://localhost:8888/.netlify/functions/stripe-webhook

# Dans un autre terminal, créer un événement de test
stripe trigger checkout.session.completed
```

### Vérifier les logs

- **Netlify Functions logs** : Netlify > Functions > Logs
- **Stripe webhooks logs** : Stripe Dashboard > Developers > Webhooks > [votre endpoint]
- **Console Supabase** : Supabase > Table Editor > stripe_order_email_notifications

---

## 8. Dépannage

### Les emails ne sont pas envoyés

1. Vérifiez que `SMTP_USER` et `SMTP_PASS` sont corrects
2. Vérifiez que le mot de passe d'application Gmail est valide
3. Vérifiez les logs Netlify Functions
4. Vérifiez que la table `stripe_order_email_notifications` existe dans Supabase

### Le webhook Stripe échoue

1. Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
2. Vérifiez que l'URL du webhook est accessible publiquement
3. Consultez les logs dans Stripe Dashboard > Webhooks
4. Testez manuellement avec "Send test webhook"

### Le numéro de commande n'apparaît pas

1. Vérifiez que la table `order_number_registry` existe
2. Vérifiez les logs de la fonction `checkout.mjs`
3. Le webhook créera le numéro en fallback si la création initiale échoue

### Erreur "SMTP Authentication failed"

- Vérifiez que la validation en deux étapes est activée sur Gmail
- Régénérez un nouveau mot de passe d'application
- Vérifiez qu'il n'y a pas d'espaces dans `SMTP_PASS`

---

## 9. Améliorations Futures

- [ ] Ajouter un système de retry automatique pour les emails échoués
- [ ] Implémenter des templates d'email personnalisables
- [ ] Ajouter des notifications par SMS (Twilio)
- [ ] Créer un dashboard de suivi des emails envoyés
- [ ] Ajouter un email lors du changement de statut de commande

---

## Contact Support

Pour toute question ou problème :
- Email : mrz.lux.perfume@gmail.com
- Documentation Stripe : https://stripe.com/docs/webhooks
- Documentation Netlify : https://docs.netlify.com/functions/overview/
