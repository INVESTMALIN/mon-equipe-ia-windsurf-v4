// Formatage partagé des factures (bloc fiche concierge + page globale admin).

// `montant` est stocké en ENTIER DE CENTIMES (cf. table invoices) : affichage en euros.
export function formatEuros(cents) {
  if (!Number.isInteger(cents)) return '—'
  return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

export function formatDateFacture(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
