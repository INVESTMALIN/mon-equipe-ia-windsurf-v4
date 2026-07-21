-- Nouveaux types de mouvement crédit pour les ajustements manuels admin.
--
-- Contexte : l'espace admin doit permettre d'AJOUTER des crédits offerts et de RETIRER
-- des crédits (correction) à un concierge fiche_lite, sans jamais toucher au ledger
-- append-only autrement que par une nouvelle ligne. On introduit deux types dédiés,
-- distincts des types métier existants (`achat`, `debit_fiche`) qui restent intacts :
--   - `offert`     → ajout manuel (ligne POSITIVE), crédits offerts par un admin ;
--   - `correction` → retrait manuel (ligne NÉGATIVE), correction par un admin.
--
-- Migration ADDITIVE : un simple ajout de valeurs d'enum, aucun writer existant n'est
-- impacté. `if not exists` rend l'opération idempotente (ré-application au merge sans
-- erreur « enum label already exists »).
--
-- Le SIGNE de ces types n'est pas contraint par credit_ledger_amount_sign_check
-- (clause `else true` pour tout type hors achat/debit_fiche, cf. migration
-- 20260707150000). L'invariant de signe (offert > 0, correction < 0) et le refus de
-- passer sous zéro sont portés par la fonction admin_adjust_credits (seul writer,
-- en service_role), migration suivante.

alter type public.credit_movement_type add value if not exists 'offert';
alter type public.credit_movement_type add value if not exists 'correction';
