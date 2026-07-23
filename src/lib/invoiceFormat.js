// Formatage partagé des factures (bloc fiche concierge + page globale admin).

// `montant` est stocké en ENTIER DE CENTIMES (cf. table invoices) : affichage en euros.
export function formatEuros(cents) {
  if (!Number.isInteger(cents)) return '—'
  return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

// `date_facture` est une date PURE (colonne `date`, chaîne « YYYY-MM-DD ») : on la
// reformate par découpage, sans passer par `new Date()` — qui l'interpréterait minuit
// UTC et afficherait la VEILLE dans tout fuseau à l'ouest de Greenwich.
export function formatDateFacture(dateStr) {
  if (typeof dateStr !== 'string') return '—'
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return '—'
  return `${m[3]}/${m[2]}/${m[1]}`
}
