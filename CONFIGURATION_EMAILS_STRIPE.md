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
STRIPE_SECRET_KEY=sk_test_... ou sk_live_...
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
   - **URL du webhook** : `https://mrz-perfume.fr/api/stripe/webhook`
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
4. Configurez ces deux variables ensemble dans l’environnement de test Netlify.

Pour la production :

1. Créez un webhook de production avec l'URL finale
2. Utilisez les clés live Stripe (`sk_live_...`)
3. Utilisez le signing secret du webhook de production
4. Gardez les variables live uniquement dans l’environnement de production.

Le webhook vérifie le paiement, enregistre la commande dans `orders`, puis envoie les emails. La page de retour confirme également la commande pour afficher immédiatement son numéro; l’enregistrement est idempotent afin de ne pas créer de doublon.

---

## 4. Recevoir les emails Stripe et les emails du site

Chaque paiement réussi peut produire **quatre messages distincts** :

| Destinataire | Email Stripe | Email du site (NodeMailer) |
|---|---|---|
| Client | Reçu Stripe du paiement | Confirmation MRZ avec numéro, articles, quantités, total et coordonnées de livraison |
| Boutique | Alerte de paiement Stripe | Notification MRZ à `mrz.lux.perfume@gmail.com` avec les articles et coordonnées du client |

### Emails Stripe

- **Reçu au client** : le checkout transmet déjà l'email du client à `payment_intent_data.receipt_email`. Dans le Dashboard Stripe, activez l'envoi des reçus pour les paiements réussis dans **Settings > Customer emails > Successful payments** (le libellé peut varier selon la langue du Dashboard).
- **Alerte à la boutique** : dans les paramètres de notifications du compte Stripe, activez les notifications email pour les paiements réussis et vérifiez que le compte destinataire est `mrz.lux.perfume@gmail.com`.
- Si vous testez, vérifiez aussi les réglages du **mode test**. Stripe et le site ont des paramètres séparés pour les emails.

Stripe contrôle ces deux emails natifs depuis son Dashboard : le code du site ne peut pas forcer Stripe à les envoyer si ces options sont désactivées.

### Emails envoyés par le site

Dans Netlify, configurez les variables SMTP (`SMTP_USER`, `SMTP_PASS`, `SMTP_HOST`, `SMTP_PORT`). À la confirmation du paiement et lors du webhook de secours, le site envoie les deux confirmations NodeMailer. Le destinataire boutique est fixé à `mrz.lux.perfume@gmail.com`; le client est pris depuis l'adresse fournie au checkout Stripe. L'état d'envoi, commun aux deux déclencheurs pour éviter les doublons, est enregistré dans `public.stripe_order_email_deliveries`.

Pour vérifier l'envoi, consultez les logs Netlify de `checkout-confirm` et `stripe-webhook`, puis la table `public.stripe_order_email_deliveries`. Les colonnes `merchant_email_status` et `customer_email_status` doivent être `sent`; `merchant_email_error` ou `customer_email_error` explique un échec.

Exécutez le fichier `supabase/stripe-order-email-notifications.sql` dans le SQL Editor Supabase après le déploiement. Il crée la table de suivi idempotente utilisée par les deux fonctions.

### Important : URL du webhook

Utilisez le domaine canonique **sans `www`** ci-dessus. Cette route `/api/stripe/webhook` est réécrite en interne vers la fonction Netlify `stripe-webhook`. L'adresse `/.netlify/functions/stripe-webhook` est également utilisable directement. Consultez l'historique des livraisons Stripe : chaque tentative doit répondre en HTTP 2xx. Si une tentative échoue, ouvrez ses détails et vérifiez le code HTTP et le corps de la réponse dans les logs de la fonction Netlify.

---

## 5. Flux des Notifications Email

### A. Lors d'un paiement réussi (Automatique via Webhook Stripe)

```
1. Client paie sur Stripe
   ↓
2. Stripe envoie un webhook à votre site
   ↓
3. Le webhook génère un numéro de commande (ex: MR12345)
   ↓
4. Deux emails sont envoyés automatiquement :
   - Email à `mrz.lux.perfume@gmail.com` avec les détails de commande
   - Email au client avec confirmation de paiement, envoyé à l'adresse saisie au checkout
```

**Fichiers concernés** :
- `client/netlify/functions/stripe-webhook.mjs` : Réception webhook
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

## 6. Structure de la Base de Données

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

## 7. Numérotation des Commandes

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

## 8. Test du Système

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

## 9. Dépannage

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

## 10. Améliorations Futures

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
