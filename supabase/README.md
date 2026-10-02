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
- `VITE_ADMIN_USER` / `VITE_ADMIN_PASS` (admin)

## 4. Importer les produits
Depuis `mrz-perfume/` :
```
npm run seed
```

## 5. Sécurité comptes
- Mots de passe hashés (PBKDF2), jamais stockés en clair.
- Auth client via `/api/auth` (Netlify Function / Express) avec la clé service_role.
- Table `customers` non lisible avec la clé publique.

## 6. Vérifier
Redémarrez `npm run dev`.
Sans variables Supabase, le site utilise un stockage local hashé.
