-- Enregistrement ATOMIQUE de la preuve de PDF et du verrou d'identité — Lite.
--
-- Problème. Le verrou d'identité et la preuve `pdf_generated_at` étaient écrits par
-- un UPDATE inconditionnel depuis le navigateur, et les garde-fous d'écran (voile
-- bloquant, refus dans updateField) ne protègent QUE l'onglet qui génère. Avec la
-- même fiche déverrouillée ouverte dans deux onglets, le second peut modifier et
-- sauvegarder l'identité du bien pendant que pdfmake produit le document du premier.
-- Le trigger `fiche_lite_enforce_lock` laisse passer : il n'interdit les changements
-- d'identité que sur une fiche DÉJÀ verrouillée. La base pouvait donc se verrouiller
-- sur l'identité de l'onglet B alors que le PDF remis contient celle de l'onglet A —
-- soit deux biens différents sur une seule fiche payée, exactement le recyclage que
-- le verrou existe pour empêcher.
--
-- Un simple SELECT de contrôle suivi d'un UPDATE séparé ne ferme pas la course : les
-- deux instructions sont deux instants distincts. Il faut que la comparaison et
-- l'écriture soient la MÊME instruction. C'est ce que fait l'UPDATE conditionnel
-- ci-dessous : PostgreSQL évalue le prédicat et écrit la ligne sous le même verrou de
-- ligne, sans fenêtre entre les deux.
--
-- Migration ADDITIVE : deux fonctions, aucune table ni colonne touchée, idempotente.

-- 1) Identité du bien exposée en champ calculé. ---------------------------------------
-- PostgREST expose une fonction prenant la ligne en argument comme une colonne
-- sélectionnable : `select=*,identite_verrouillee`. Cela permet à `saveFiche` de
-- récupérer, dans le RETURNING de SA PROPRE écriture, l'identité telle qu'elle vient
-- de l'écrire — la seule valeur dont on puisse affirmer qu'elle correspond au PDF.
--
-- La relire dans un second appel ne conviendrait pas : entre les deux, un autre onglet
-- a pu écrire, et on comparerait alors contre SA version.
--
-- Réutilise `fiche_lite_locked_projection` (20260713170000) : une seule définition de
-- ce qui « identifie le bien », partagée par le trigger de verrou et par ce contrôle.
-- Une copie en JavaScript aurait fini par diverger, et une divergence ici fausserait
-- silencieusement la comparaison.
create or replace function public.identite_verrouillee(f public.fiche_lite)
returns jsonb
language sql
stable
as $$
  select public.fiche_lite_locked_projection(f.section_proprietaire, f.section_logement);
$$;

comment on function public.identite_verrouillee(public.fiche_lite) is
  'Champ calculé PostgREST : projection des sous-clés qui identifient le bien. '
  'Sélectionner via select=*,identite_verrouillee pour obtenir, dans le RETURNING '
  'd''une écriture, l''identité que cette écriture vient de poser.';

-- 2) Écriture conditionnée à cette identité. ------------------------------------------
-- Renvoie true si la ligne a été mise à jour, false si l''identité en base ne
-- correspond plus (modifiée ailleurs) ou si la fiche n''est pas visible du caller.
--
-- SECURITY INVOKER (défaut) : la RLS de `fiche_lite` s''applique au caller, un
-- utilisateur ne peut donc écrire que sur ses propres fiches, exactement comme avant.
-- Le trigger de verrou s''applique aussi et laisse passer, puisque cet UPDATE ne
-- touche pas aux sous-clés d''identité.
--
-- `fields_locked or p_verrouiller` : on ne DÉverrouille jamais. Une fiche déjà
-- verrouillée le reste, quelle que soit la valeur demandée.
--
-- L''écriture est idempotente : rejouée avec le même horodatage et la même identité,
-- elle réécrit exactement les mêmes valeurs.
create or replace function public.fiche_lite_enregistrer_pdf(
  p_fiche_id    uuid,
  p_horodatage  timestamptz,
  p_verrouiller boolean,
  p_identite    jsonb
)
returns boolean
language sql
volatile
as $$
  with maj as (
    update public.fiche_lite
       set pdf_generated_at = p_horodatage,
           fields_locked    = fields_locked or coalesce(p_verrouiller, false)
     where id = p_fiche_id
       -- Comparaison et écriture dans la MÊME instruction : c'est ce qui ferme la
       -- course entre onglets. `jsonb =` ignore l'ordre des clés.
       and public.fiche_lite_locked_projection(section_proprietaire, section_logement)
           is not distinct from p_identite
    returning 1
  )
  select exists (select 1 from maj);
$$;

comment on function public.fiche_lite_enregistrer_pdf(uuid, timestamptz, boolean, jsonb) is
  'Écrit pdf_generated_at (et pose fields_locked si demandé) UNIQUEMENT si l''identité '
  'du bien en base est encore celle passée en argument, c''est-à-dire celle qui a servi '
  'à produire le PDF. Renvoie false si elle a changé entre-temps — fiche modifiée dans '
  'une autre session — auquel cas rien n''est écrit et surtout rien n''est verrouillé.';

grant execute on function public.identite_verrouillee(public.fiche_lite) to authenticated;
grant execute on function public.fiche_lite_enregistrer_pdf(uuid, timestamptz, boolean, jsonb) to authenticated;
