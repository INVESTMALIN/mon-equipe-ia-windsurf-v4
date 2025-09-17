// src/components/fiche/MiniDashboard.jsx
import { detectAlertes, generateApercu } from '../../lib/AlerteDetector'

export default function MiniDashboard({ formData }) {
  const apercu = generateApercu(formData)
  const alertes = detectAlertes(formData)

  return (
    <div className="space-y-6">
      {/* PARTIE 1 - APERÇU */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">📊</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Aperçu du logement</h3>
            <p className="text-sm text-gray-600">Caractéristiques principales</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Carte Capacité */}
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-sm text-gray-600 mb-1">Capacité</div>
            <div className="font-semibold text-gray-900">{apercu.capacite.personnes} personnes</div>
            <div className="text-xs text-gray-500">{apercu.capacite.chambres} chambres • {apercu.capacite.lits} lits</div>
          </div>

          {/* Carte Surface */}
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-sm text-gray-600 mb-1">Surface</div>
            <div className="font-semibold text-gray-900">{apercu.capacite.surface}</div>
            <div className="text-xs text-gray-500">{apercu.nom}</div>
          </div>

          {/* Carte WiFi */}
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-sm text-gray-600 mb-1">WiFi</div>
            <div className={`font-semibold ${apercu.equipements.wifi.disponible ? 'text-green-600' : 'text-red-600'}`}>
              {apercu.equipements.wifi.texte}
            </div>
          </div>

          {/* Carte Parking */}
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-sm text-gray-600 mb-1">Parking</div>
            <div className="font-semibold text-gray-900">{apercu.equipements.parking.texte}</div>
          </div>
        </div>

        {/* Atouts */}
        {apercu.atouts.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-900 mb-3">🌟 Atouts principaux</div>
            <div className="flex flex-wrap gap-2">
              {apercu.atouts.map((atout, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {atout}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PARTIE 2 - ALERTES */}
      {(alertes.critiques.length > 0 || alertes.moderees.length > 0 || alertes.elementsAbimes.length > 0) && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🚨</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Points d'attention</h3>
              <p className="text-sm text-gray-600">Éléments à surveiller ou corriger</p>
            </div>
          </div>

          {/* Alertes critiques */}
          {alertes.critiques.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-red-600">🔴</span>
                <span className="font-semibold text-red-900">Critique ({alertes.critiques.length})</span>
              </div>
              <div className="space-y-2">
                {alertes.critiques.map((alerte, index) => (
                  <div key={index} className="bg-red-100 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{alerte.icone}</span>
                      <div className="flex-1">
                        <div className="font-medium text-red-900">{alerte.titre}</div>
                        <div className="text-sm text-red-700">{alerte.message}</div>
                        {alerte.action && (
                          <div className="text-xs text-red-600 mt-1 font-medium">→ {alerte.action}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alertes modérées */}
          {alertes.moderees.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-orange-600">🟡</span>
                <span className="font-semibold text-orange-900">Modéré ({alertes.moderees.length})</span>
              </div>
              <div className="space-y-2">
                {alertes.moderees.map((alerte, index) => (
                  <div key={index} className="bg-orange-100 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{alerte.icone}</span>
                      <div className="flex-1">
                        <div className="font-medium text-orange-900">{alerte.titre}</div>
                        <div className="text-sm text-orange-700">{alerte.message}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Éléments abîmés */}
          {alertes.elementsAbimes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-yellow-600">⚠️</span>
                <span className="font-semibold text-yellow-900">Éléments abîmés ({alertes.elementsAbimes.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {alertes.elementsAbimes.map((alerte, index) => (
                  <div key={index} className="bg-yellow-100 border border-yellow-200 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <span>{alerte.icone}</span>
                      <span className="text-sm font-medium text-yellow-900">{alerte.espace}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message si aucune alerte */}
      {alertes.critiques.length === 0 && alertes.moderees.length === 0 && alertes.elementsAbimes.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">✅</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">Aucune alerte détectée</h3>
              <p className="text-sm text-green-700">Le logement ne présente pas de problème majeur identifié</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}