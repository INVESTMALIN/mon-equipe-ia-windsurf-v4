-- Intégrité montant ↔ type (retour Codex) — lier le SIGNE du montant au type de
-- mouvement, pour que les chemins d'écriture service role ne puissent pas créditer
-- ou débiter à l'envers. `amount <> 0` ne rejetait que le zéro : un `debit_fiche`
-- positif ou un `achat` négatif passait, et comme get_credit_balance somme `amount`,
-- un bug d'un writer accordait/retirait des crédits en silence (et l'append-only
-- figeait ensuite la mauvaise ligne).
--
-- Règle posée UNIQUEMENT sur les deux types actuels :
--   - achat        → montant strictement positif ;
--   - debit_fiche  → montant strictement négatif.
-- `else true` : tout futur type (bonus, remboursement, …) reste NON contraint ici, de
-- sorte qu'un simple `ALTER TYPE ... ADD VALUE` ne casse pas les inserts. On resserrera
-- cette CHECK quand on définira le signe de ces nouveaux types (migration dédiée).
-- La CHECK `amount <> 0` d'origine reste en place (aucun mouvement nul, tous types).

alter table public.credit_ledger
  add constraint credit_ledger_amount_sign_check check (
    case type
      when 'achat'       then amount > 0
      when 'debit_fiche' then amount < 0
      else true
    end
  );
