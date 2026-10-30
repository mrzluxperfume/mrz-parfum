# Supabase — MRZ Perfume

## 1. Créer le projet
1. Allez sur https://supabase.com et créez un projet.
2. Dans **Project Settings → API**, copiez :
   - **Project URL**
   - **anon public** / publishable key
   - **service_role** / secret key (jamais dans le frontend)

## 2. Créer les tables
1. Ouvrez **SQL Editor**.
2. Collez le contenu de `supabase/schema.sql`.
3. Cliquez **Run**.

Si le projet existait déjà avec l’ancienne policy ouverte sur `customers` :
collez aussi `supabase/secure-customers.sql` puis **Run**.

Pour activer les emails de commande payée, exécutez aussi
`supabase/stripe-order-email-notifications.sql` dans le SQL Editor. Si vous
l’aviez déjà exécuté, relancez-le pour ajouter le suivi séparé des emails
vendeur et client, ainsi que le registre qui garantit un numéro unique au
format `MR12345` pour chaque session Stripe payée.

## 3. Variables d’environnement

### En local — `server/.env`
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

### En local — `client/.env`
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_ADMIN_USER=mrzparfum
VITE_ADMIN_PASS=mot-de-passe-admin-fort
```

### Sur Netlify
Ajoutez :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL` (même URL)
- `SUPABASE_SERVICE_ROLE_KEY` (secret — pour `/api/auth`)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (secret de signature de l’endpoint ci-dessous)
- `SMTP_USER` / `SMTP_PASS`
- `MAIL_TO` (email qui reçoit les nouvelles commandes; sinon `SMTP_USER`)
- `VITE_ADMIN_USER` / `VITE_ADMIN_PASS` (admin)

## 4. Emails et notifications Stripe

Dans Stripe, ajoutez un endpoint webhook vers
`https://mrz-perfume.fr/api/stripe/webhook` et abonnez-le aux événements
`checkout.session.completed` et `checkout.session.async_payment_succeeded`.
Copiez son secret de signature (`whsec_...`) dans la variable Netlify
`STRIPE_WEBHOOK_SECRET`. Configurez aussi les variables SMTP ci-dessus pour
que le vendeur et le client reçoivent chacun leur email après chaque paiement
confirmé. L’email client contient la référence, les articles, les quantités et
le total payé.

Créez un endpoint distinct en mode test si vous souhaitez tester les paiements
Stripe en mode test. Le tableau de bord Stripe conserve aussi chaque paiement
réussi dans sa liste des paiements.

## 5. Importer les produits
Depuis `mrz-perfume/` :
```
npm run seed
```

## 6. Sécurité comptes
- Mots de passe hashés (PBKDF2), jamais stockés en clair.
- Auth client via `/api/auth` (Netlify Function / Express) avec la clé service_role.
- Table `customers` non lisible avec la clé publique.

## 7. Vérifier
Redémarrez `npm run dev`.
Sans variables Supabase, le site utilise un stockage local hashé.
