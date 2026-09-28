# MRZ Perfume — E-commerce premium

## Stack (Phase 1–2 livrée)

- **Frontend** : React + Vite + Tailwind CSS v4 + React Router + Framer Motion + Axios + Lucide
- **Design** : identité originale MRZ, structure UX inspirée du fichier Figma fourni
- **Données** : catalogue temporaire basé sur `products_seed.json` (contenu MRZ)

## Démarrage

```bash
cd mrz-perfume
npm run install:all
cd client && npm run dev
```

Ou depuis la racine (si `concurrently` est configuré) :

```bash
npm run install:all
npm run dev
```

Client : http://localhost:5173

## Structure client

```
client/src/
  components/   layout, ui, product, home
  pages/
  layouts/
  context/
  hooks/
  services/
  assets/
  data/
  utils/
```

## Prochaines phases

3. ✅ Homepage (cette livraison)
4. Shop + filtres
5. Product details
6. Cart + Checkout
7. Backend MongoDB/Express
8. Connexion API
9. Auth
10. Admin
11. SEO / perf
12. Tests
