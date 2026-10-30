# Configuration des Notifications Email Automatiques

## 🎯 Système de Notification Automatique

Le système envoie **automatiquement** deux emails dès qu'une commande est ajoutée dans la base de données :
1. **Email au propriétaire** : Notification de nouvelle commande
2. **Email au client** : Confirmation de commande

**Aucun bouton manuel nécessaire** - tout est automatique !

---

## 📋 Étape 1 : Configurer les Variables d'Environnement Netlify

Allez dans **Netlify Dashboard > Site Settings > Environment variables** et ajoutez :

```
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application-16-caracteres
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
MAIL_TO=votre-email@gmail.com
```

### Comment obtenir le mot de passe d'application Gmail :

1. Allez sur https://myaccount.google.com/security
2. Activez la **Validation en deux étapes**
3. Cherchez **Mots de passe des applications**
4. Créez un nouveau mot de passe pour "MRZ Perfume"
5. Copiez le mot de passe de 16 caractères (sans espaces)
6. Utilisez-le pour `SMTP_PASS`

---

## 📋 Étape 2 : Configurer le Trigger Supabase

### 2.1 Exécuter le script SQL dans Supabase

1. Ouvrez **Supabase Dashboard**
2. Allez dans **SQL Editor**
3. Cliquez sur **New query**
4. Copiez le contenu du fichier `supabase/order-notification-trigger.sql`
5. Cliquez sur **Run**

Ce script crée :
- Une table `order_email_notifications` pour tracker les emails envoyés
- Un trigger qui détecte automatiquement les nouvelles commandes
- Une fonction qui appelle le webhook Netlify

### 2.2 Activer l'extension pg_net

Dans le même SQL Editor, exécutez :

```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

Cette extension permet à Supabase d'appeler des webhooks HTTP.

### 2.3 Configurer l'URL du webhook

Exécutez cette commande SQL (remplacez l'URL par votre domaine) :

```sql
ALTER DATABASE postgres 
SET app.settings.order_webhook_url = 'https://www.mrz-perfume.fr/.netlify/functions/order-notification';
```

Pour le développement/test :
```sql
ALTER DATABASE postgres 
SET app.settings.order_webhook_url = 'https://votre-site-test.netlify.app/.netlify/functions/order-notification';
```

---

## 📋 Étape 3 : Déployer sur Netlify

1. Commitez tous les fichiers modifiés :
   ```bash
   cd "Youssef web site/mrz-perfume"
   git add .
   git commit -m "Ajout notifications email automatiques"
   git push
   ```

2. Netlify déploiera automatiquement les nouvelles fonctions

3. Vérifiez que la fonction `order-notification` est bien déployée dans **Netlify > Functions**

---

## 📋 Étape 4 : Tester le Système

### Test complet :

1. Passez une commande de test sur le site
2. La commande est ajoutée dans la table `orders` de Supabase
3. Le trigger détecte l'insertion automatiquement
4. Deux emails sont envoyés :
   - Un à `MAIL_TO` (vous)
   - Un au client

### Vérifier les logs :

- **Logs Netlify** : Netlify > Functions > order-notification > Logs
- **Logs Supabase** : Supabase > SQL Editor
  ```sql
  SELECT * FROM order_email_notifications ORDER BY created_at DESC;
  ```

---

## 🔄 Flux Automatique Complet

```
┌─────────────────────────────────────────────────────┐
│  1. Client paie sur Stripe                          │
│     ↓                                                │
│  2. Stripe webhook génère numéro MR12345            │
│     ↓                                                │
│  3. Emails automatiques Stripe (déjà en place)      │
│     • Email au propriétaire (paiement confirmé)     │
│     • Email au client (paiement reçu)               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  4. Commande ajoutée dans Supabase                  │
│     ↓                                                │
│  5. Trigger Supabase détecte la nouvelle commande   │
│     ↓                                                │
│  6. Webhook appelle Netlify                         │
│     ↓                                                │
│  7. Netlify Function envoie emails automatiques     │
│     • Email au propriétaire (nouvelle commande)     │
│     • Email au client (confirmation commande)       │
└─────────────────────────────────────────────────────┘
```

**Résultat** : Le propriétaire et le client reçoivent chacun **2 emails** automatiquement :
- **Email Stripe** : Confirmation de paiement
- **Email système** : Confirmation de commande avec détails

---

## 📧 Contenu des Emails

### Email au propriétaire (MAIL_TO) :
- ✅ Sujet : "Nouvelle commande — MR12345"
- ✅ Numéro de commande
- ✅ Informations client (nom, email, téléphone, adresse)
- ✅ Liste des articles commandés
- ✅ Total de la commande
- ✅ Note du client (si présente)

### Email au client :
- ✅ Sujet : "Confirmation de votre commande MRZ — MR12345"
- ✅ Numéro de commande
- ✅ Liste détaillée des articles
- ✅ Total
- ✅ Adresse de livraison
- ✅ Message de remerciement

---

## 🛠️ Fichiers Créés/Modifiés

### Nouveaux fichiers :
1. `supabase/order-notification-trigger.sql` - Script SQL pour le trigger automatique
2. `client/netlify/functions/order-notification.mjs` - Webhook pour envoyer les emails
3. `CONFIGURATION_EMAILS_AUTOMATIQUES.md` - Cette documentation

### Fichiers modifiés :
1. `client/netlify/functions/checkout.mjs` - Génération numéro de commande
2. `client/netlify/functions/mail.mjs` - Nouvelles fonctions d'email
3. `client/src/pages/admin/AdminOrdersPage.jsx` - Retrait du bouton manuel

---

## 🐛 Dépannage

### Les emails ne sont pas envoyés

1. **Vérifier les logs Netlify** :
   - Netlify > Functions > order-notification > Recent invocations
   - Cherchez des erreurs SMTP

2. **Vérifier le trigger Supabase** :
   ```sql
   SELECT * FROM order_email_notifications ORDER BY created_at DESC LIMIT 10;
   ```
   - Si vide : le trigger ne se déclenche pas
   - Si présent avec `merchant_error` ou `customer_error` : problème d'envoi email

3. **Vérifier les variables d'environnement** :
   - Netlify > Site Settings > Environment variables
   - Assurez-vous que `SMTP_USER`, `SMTP_PASS`, `MAIL_TO` sont corrects

4. **Tester manuellement la fonction** :
   ```bash
   curl -X POST https://www.mrz-perfume.fr/.netlify/functions/order-notification \
     -H "Content-Type: application/json" \
     -d '{
       "order_id": "MR00001",
       "customer": {"name": "Test Client", "email": "test@example.com"},
       "items": [{"name": "Parfum Test", "quantity": 1, "unitPrice": 50}],
       "total": 50
     }'
   ```

### Le trigger ne se déclenche pas

1. Vérifiez que l'extension pg_net est installée :
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_net';
   ```

2. Vérifiez que le trigger existe :
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_order_created';
   ```

3. Testez manuellement l'insertion :
   ```sql
   INSERT INTO orders (id, customer, items, total)
   VALUES (
     'MR00099',
     '{"name":"Test","email":"test@test.com"}'::jsonb,
     '[{"name":"Test Product","quantity":1,"unitPrice":10}]'::jsonb,
     10
   );
   ```

### Erreur "SMTP Authentication failed"

- Régénérez un nouveau mot de passe d'application Gmail
- Vérifiez qu'il n'y a pas d'espaces dans `SMTP_PASS`
- Testez avec un autre compte Gmail

---

## ✅ Checklist de Configuration

- [ ] Variables d'environnement SMTP configurées dans Netlify
- [ ] Mot de passe d'application Gmail généré
- [ ] Script SQL `order-notification-trigger.sql` exécuté dans Supabase
- [ ] Extension `pg_net` activée dans Supabase
- [ ] URL du webhook configurée dans Supabase
- [ ] Code déployé sur Netlify
- [ ] Test d'une commande effectué
- [ ] Emails reçus par le propriétaire et le client

---

## 🎉 C'est Terminé !

Une fois configuré, le système fonctionne **100% automatiquement** :
- ✅ Aucun bouton à cliquer
- ✅ Emails envoyés instantanément
- ✅ Notifications pour chaque nouvelle commande
- ✅ Confirmation automatique au client

**Support** : mrz.lux.perfume@gmail.com
