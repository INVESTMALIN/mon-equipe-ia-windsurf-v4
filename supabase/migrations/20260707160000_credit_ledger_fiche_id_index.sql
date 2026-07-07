-- Perf cascade fiche (retour Codex) — indexer fiche_id pour borner le SET NULL.
--
-- La suppression d'une fiche déclenche `fiche_id` ON DELETE SET NULL, qui doit
-- localiser les lignes de crédit par `fiche_id`. Sans index dédié (seul user_id
-- l'était), chaque suppression de fiche scannerait tout le ledger et tiendrait la
-- mise à jour référentielle plus longtemps — chemin de suppression d'autant plus lent
-- que le ledger grossit.
--
-- Index PARTIEL (fiche_id is not null) : la grande majorité des lignes sont des
-- achats sans fiche (fiche_id null) ; on n'indexe que les débits réellement liés à
-- une fiche. La cascade cherche `WHERE fiche_id = <id supprimé>`, jamais NULL, donc
-- l'index partiel la sert intégralement tout en restant plus petit.

create index credit_ledger_fiche_id_idx on public.credit_ledger (fiche_id)
  where fiche_id is not null;
