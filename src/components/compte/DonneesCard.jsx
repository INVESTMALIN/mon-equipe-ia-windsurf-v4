import { Shield, Trash2, Mail } from 'lucide-react'
import { CARD } from './cardClass'

// Carte « Vos données et vie privée », commune aux deux mondes par son cadre (rappel des
// droits RGPD + lien CNIL), différente par son contenu :
//
// - Mon Équipe IA (user, admin) : conservation des conversations et bouton de suppression
//   de l'historique. Bloc DÉPLACÉ tel quel depuis MonCompte.jsx.
// - Fiche Logement Lite (fiche_lite) : ce qui est réellement conservé de son côté (fiches,
//   annonces, guides, PDF, compte, crédits) et ce qui ne l'est pas (aucune photo, aucune
//   vidéo). Rédaction validée par Julien le 15/09/2026. Aucune durée de conservation ni
//   anonymisation n'y figure : rien dans le code ne les implémente pour les fiches, on
//   ne promet pas ce que le produit ne tient pas. Un concierge n'a pas de conversations :
//   ni le texte ni le bouton de suppression d'historique ne lui sont montrés.
export default function DonneesCard({ isFicheLite, contactEmail, onDeleteClick, deleting }) {
  return (
    <div className={CARD}>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-[#dbae61]" />
        <h2 className="text-xl font-bold text-black">Vos données et vie privée</h2>
      </div>

      <div className="space-y-4 text-gray-700">
        <p className="leading-relaxed">
          Conformément au <strong>RGPD</strong> (Règlement Général sur la Protection des Données),
          vous disposez d’un droit d’accès, de rectification et de suppression de vos données personnelles.
        </p>

        {isFicheLite ? (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Vos données Fiche Logement Lite</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                Nous conservons les données nécessaires au fonctionnement du service : vos fiches
                logement et les informations que vous y saisissez, les annonces, guides d’accès et
                PDF générés, vos informations de compte et l’historique de vos crédits.
              </p>
              <p>
                Nous ne stockons aucune photo. Les champs photo sont uniquement des rappels de prise
                de vue. La vidéo transmise pour générer un guide d’accès n’est pas conservée après
                son traitement.
              </p>
              <p>
                Vous pouvez supprimer vos fiches depuis « Mes fiches ». Pour exercer vos droits
                d’accès, de rectification ou de suppression,{' '}
                <a href={`mailto:${contactEmail}`} className="font-semibold underline hover:no-underline">
                  contactez-nous
                </a>.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Conservation de vos conversations</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Vos conversations sont conservées pour améliorer nos services</li>
              <li>• Après 12 mois, elles sont anonymisées (suppression de votre identité)</li>
              <li>• Vous pouvez supprimer tout votre historique à tout moment ci-dessous</li>
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          {isFicheLite ? (
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#dbae61] hover:bg-[#c49a4f] text-white font-semibold rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4" />
              Nous contacter
            </a>
          ) : (
            <button
              onClick={onDeleteClick}
              disabled={deleting}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Suppression en cours...' : 'Supprimer tout mon historique'}
            </button>
          )}

          <a
            href="https://www.cnil.fr/fr/reglement-europeen-protection-donnees"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            En savoir plus sur le RGPD →
          </a>
        </div>
      </div>
    </div>
  )
}
