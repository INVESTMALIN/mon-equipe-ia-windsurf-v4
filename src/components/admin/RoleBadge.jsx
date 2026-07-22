import { Shield } from 'lucide-react'

// Badge « monde + niveau d'accès », convention commune liste + fiche admin.
// Deux mondes étanches : Mon Équipe IA (user/admin, abonnement) et
// Fiche Logement Lite (fiche_lite, crédits). Le monde se dérive du rôle.
export default function RoleBadge({ role }) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#dbae61] bg-opacity-20 text-[#8b7355]">
        <Shield className="w-3 h-3" />
        Mon Équipe IA · Admin
      </span>
    )
  }
  if (role === 'fiche_lite') {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Fiche Logement</span>
  }
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Mon Équipe IA</span>
}
