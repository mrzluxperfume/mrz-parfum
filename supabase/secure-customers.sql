-- Sécuriser la table customers (à exécuter une fois dans SQL Editor)
-- Empêche la lecture publique des hash de mots de passe via la clé anon.

drop policy if exists "customers_all" on public.customers;

-- RLS reste activé : sans policy, la clé anon ne peut plus lire/écrire.
-- L'API (service_role) continue d'accéder aux comptes.
