# Supabase — MRZ Perfume

## 1. Créer le projet
1. Allez sur https://supabase.com et créez un projet.
2. Dans **Project Settings → API**, copiez :
   - **Project URL**
   - **anon public** key
   - **service_role** key (secret)

## 2. Créer les tables
1. Ouvrez **SQL Editor**.
2. Collez le contenu de `supabase/schema.sql`.
3. Cliquez **Run**.

## 3. Variables d’environnement

### En local — `server/.env`
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...service_role...
```

### En local — `client/.env`
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...anon...
```

### Sur Netlify
Ajoutez les mêmes `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.

## 4. Importer les produits
Depuis `mrz-perfume/` :
```
npm run seed
```
Cela envoie les 6 collections et les 48 produits dans Supabase.

## 5. Vérifier
Redémarrez `npm run dev` dans `client/`.
La boutique lit alors produits, collections, commandes et témoignages depuis Supabase.
Sans ces variables, le site continue avec localStorage.
