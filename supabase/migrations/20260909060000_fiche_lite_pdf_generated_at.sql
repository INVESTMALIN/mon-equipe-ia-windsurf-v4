-- Preuve persistante de génération du PDF d'une fiche — Fiche Logement Lite.
--
-- Contexte : le dashboard affiche désormais les livrables déjà produits pour
-- chaque fiche (PDF, annonce, guide d'accès). Le guide se prouve par
-- `section_guide_acces.guide_genere_at`, l'annonce par une ligne exploitable
-- d'`agent_outputs`. Le PDF, lui, n'avait AUCUNE trace en base : il est construit
-- côté navigateur et remis à l'utilisateur, sans rien écrire.
--
-- Pourquoi une colonne dédiée plutôt que `fields_locked` :
-- le verrou est bien posé par la 1re génération de PDF, mais il est RÉVERSIBLE —
-- un admin peut le retirer en service_role (cf. 20260713170000_fiche_lite_field_lock).
-- Après un tel déverrouillage, la fiche a bel et bien un PDF alors que le flag est
-- redevenu false : s'en servir de preuve produirait un FAUX NÉGATIF, un badge qui
-- disparaît alors que le livrable existe toujours. Et le flag ne couvre de toute
-- façon pas les fiches premium, qui génèrent des PDF sans jamais être verrouillées.
-- D'où une donnée dédiée, qui ne dit qu'une chose et la dit pour tous les rôles.
--
-- Migration ADDITIVE et idempotente : colonne nullable, sans valeur par défaut,
-- aucune contrainte. Rien ne casse si elle est appliquée avant le déploiement du
-- front. En revanche elle doit être appliquée AVANT ce déploiement : le dashboard
-- sélectionne la colonne, et PostgREST rejette la requête ENTIÈRE sur une colonne
-- inconnue (42703) — la liste des fiches se viderait.
--
-- La reprise des fiches historiques n'est PAS ici : c'est une correction de
-- données ponctuelle, non rejouable sur une base neuve, exécutée séparément.
-- Voir docs/migrations/2026-09-09_backfill_pdf_generated_at.sql.

alter table public.fiche_lite
  add column if not exists pdf_generated_at timestamptz;

comment on column public.fiche_lite.pdf_generated_at is
  'Horodatage de la dernière génération de PDF réussie pour cette fiche. NULL = aucun '
  'PDF connu. Écrit par le front à chaque génération, TOUS RÔLES CONFONDUS (premium '
  'inclus), contrairement à fields_locked qui ne concerne que le parcours fiche_lite. '
  'Le dashboard n''utilise que la PRÉSENCE de la valeur pour afficher le badge « PDF » : '
  'la date elle-même n''est pas affichée, et les valeurs issues de la reprise historique '
  'du 09/09/2026 sont approximatives (cf. docs/migrations). Ne jamais dériver cette '
  'preuve de fields_locked : le verrou est réversible par un admin, et son retrait ne '
  'supprime pas le PDF déjà émis.';
