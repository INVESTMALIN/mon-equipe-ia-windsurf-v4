-- Idempotence du débit de fiche — au plus UN débit par fiche, garanti en base.
--
-- Règle métier : 1 fiche créée = 1 crédit débité, jamais deux. Un double-clic, un retry
-- réseau ou un rechargement ne doivent pas produire deux lignes `debit_fiche` pour la
-- MÊME fiche. On pose la garantie sur le ledger lui-même, pas dans le code applicatif.
--
-- Index PARTIEL sur `fiche_id` restreint aux débits de fiche : une fiche donnée ne peut
-- apparaître qu'une fois comme cause d'un `debit_fiche`. `fiche_id is not null` exclut
-- les lignes dont la fiche a été supprimée (cascade ON DELETE SET NULL neutralise
-- `fiche_id` → la ligne d'argent reste, mais sort de l'index) et les mouvements sans
-- fiche (achats). NB : deux clics qui créent DEUX fiches distinctes = deux fiche_id
-- distincts = deux débits légitimes ; ce qu'on interdit, c'est deux débits pour UNE fiche.

create unique index credit_ledger_one_debit_per_fiche
  on public.credit_ledger (fiche_id)
  where type = 'debit_fiche' and fiche_id is not null;
