-- Profil « Trouver mon parfum » par produit
-- À coller dans : Supabase → SQL Editor → Run

alter table public.products
  add column if not exists match_profile jsonb not null default '{}'::jsonb;

comment on column public.products.match_profile is
  'Profil quiz Trouver mon parfum: { univers[], moments[], presence, traits[] }';
