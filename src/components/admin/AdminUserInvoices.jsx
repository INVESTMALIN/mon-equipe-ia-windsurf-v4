import { useEffect, useState, useCallback } from 'react'
import { FileText, AlertCircle, ExternalLink } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import { formatEuros, formatDateFacture } from '../../lib/invoiceFormat'

// Bloc Factures de la fiche concierge (/admin/users/:id) — TRONC COMMUN, volontairement
// hors du bloc crédits : une facture n'appartient à aucun des deux mondes, et le jour où
// les abonnements Premium deviennent payants le bloc est déjà au bon endroit.
//
// Lecture DIRECTE depuis le client (pas d'endpoint serverless) : la policy RLS
// `invoices_select_admin` porte la garantie d'accès en base — écart assumé au réflexe
// service_role, la table est une archive en lecture seule pour l'admin (aucune policy
// d'écriture cliente n'existe).

// Le lien vient du payload de Kevin via la base : on ne rend un <a> que pour du
// http(s), jamais un autre schéma.
export function DriveLink({ href }) {
  if (typeof href !== 'string' || !/^https?:\/\//i.test(href)) {
    return <span className="text-gray-400">—</span>
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm text-[#dbae61] hover:underline"
    >
      Ouvrir le PDF <ExternalLink className="w-3.5 h-3.5" />
    </a>
  )
}

// `numero_facture` arrive à null aujourd'hui (bug de mappage côté Kevin, en cours de
// correction) : l'afficher lisiblement plutôt qu'une case vide.
export function NumeroFacture({ numero }) {
  if (!numero) return <span className="text-gray-400 italic">Sans numéro</span>
  return <span className="text-gray-900 font-medium">{numero}</span>
}

export default function AdminUserInvoices({ userId }) {
  const [invoices, setInvoices] = useState(null)
  const [error, setError] = useState(null)

  const fetchInvoices = useCallback(async () => {
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('invoices')
      .select('id, numero_facture, montant, date_facture, lien_drive')
      .eq('user_id', userId)
      .order('date_facture', { ascending: false, nullsFirst: false })
      .order('received_at', { ascending: false })

    if (fetchError) {
      console.error('Erreur chargement factures:', fetchError)
      setError('Erreur lors du chargement des factures.')
      return
    }
    setInvoices(data || [])
  }, [userId])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-black flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-[#dbae61]" /> Factures
      </h2>

      {error ? (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="text-sm">
            {error}{' '}
            <button onClick={fetchInvoices} className="underline hover:no-underline">Réessayer</button>
          </p>
        </div>
      ) : invoices === null ? (
        <p className="text-sm text-gray-500">Chargement des factures…</p>
      ) : invoices.length === 0 ? (
        <p className="text-sm text-gray-500">
          Aucune facture archivée pour ce compte. Les factures apparaissent ici
          automatiquement à chaque paiement encaissé côté Invest Malin.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Numéro</th>
                <th className="py-2 pr-4 text-right">Montant</th>
                <th className="py-2">Facture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="py-2 pr-4 text-gray-600 whitespace-nowrap">{formatDateFacture(inv.date_facture)}</td>
                  <td className="py-2 pr-4"><NumeroFacture numero={inv.numero_facture} /></td>
                  <td className="py-2 pr-4 text-right font-medium text-gray-900 whitespace-nowrap">{formatEuros(inv.montant)}</td>
                  <td className="py-2"><DriveLink href={inv.lien_drive} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
