// src/components/fiche/sections/FicheForm.jsx - ADAPTER AU LAYOUT WIZARD
import { ArrowLeft, Save, ArrowRight, FileText, User, MapPin, Mail, Phone, Lock } from 'lucide-react'
import { useForm } from '../../FormContext'
import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'

const BASE_INPUT = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"

export default function FicheForm() {
  const { formData, updateField, isFieldLocked, isFicheLocked } = useForm()

  const handleInputChange = (path, value) => {
    updateField(path, value)
  }

  // Champs d'identité du bien : grisés + non éditables une fois la fiche verrouillée
  // (après 1re génération de PDF). Les autres champs restent normaux.
  const fieldCls = (path) =>
    isFieldLocked(path) ? `${BASE_INPUT} bg-gray-100 text-gray-400 cursor-not-allowed` : BASE_INPUT
  const lockExtra = (path) =>
    isFieldLocked(path) ? { disabled: true, title: 'Champ verrouillé après génération du PDF' } : {}

  return (
    <div className="flex min-h-screen">
      {/* 🔥 AJOUT : SidebarMenu */}
      <SidebarMenu />

      <div className="flex-1 flex flex-col">
        {/* 🔥 AJOUT : ProgressBar */}
        <ProgressBar />

        <div className="flex-1 p-6 bg-gray-100">

          {/* Contenu principal - garde le design existant mais dans le bon container */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Informations Propriétaire</h1>

            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Propriétaire</h2>
                    <p className="text-gray-600">Coordonnées du propriétaire du logement</p>
                  </div>
                </div>
              </div>

              {isFicheLocked && (
                <div className="mb-6 flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600">
                  <Lock className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                  <span>
                    Le PDF a été généré : les champs qui identifient le bien (nom du propriétaire, adresse) sont verrouillés. Les autres champs restent modifiables.
                  </span>
                </div>
              )}

              <div className="space-y-6">
                {/* Nom de la fiche */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Nom de la fiche *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Appartement Centre-ville"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                    value={formData.nom}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                  />
                </div>

                {/* Nom du propriétaire */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Nom du propriétaire *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Prénom"
                      className={fieldCls('section_proprietaire.prenom')}
                      {...lockExtra('section_proprietaire.prenom')}
                      value={formData.section_proprietaire.prenom}
                      onChange={(e) => handleInputChange('section_proprietaire.prenom', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Nom de famille"
                      className={fieldCls('section_proprietaire.nom')}
                      {...lockExtra('section_proprietaire.nom')}
                      value={formData.section_proprietaire.nom}
                      onChange={(e) => handleInputChange('section_proprietaire.nom', e.target.value)}
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-gray-900 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email *
                    </label>
                    <input
                      type="email"
                      placeholder="exemple@exemple.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                      value={formData.section_proprietaire.email}
                      onChange={(e) => handleInputChange('section_proprietaire.email', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-900 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      placeholder="06 12 34 56 78"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                      value={formData.section_proprietaire.telephone}
                      onChange={(e) => handleInputChange('section_proprietaire.telephone', e.target.value)}
                    />
                  </div>
                </div>

                {/* Adresse */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Adresse du bien
                  </label>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Numéro et nom de rue"
                      className={fieldCls('section_proprietaire.adresse.rue')}
                      {...lockExtra('section_proprietaire.adresse.rue')}
                      value={formData.section_proprietaire.adresse.rue}
                      onChange={(e) => handleInputChange('section_proprietaire.adresse.rue', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Complément d'adresse (optionnel)"
                      className={fieldCls('section_proprietaire.adresse.complement')}
                      {...lockExtra('section_proprietaire.adresse.complement')}
                      value={formData.section_proprietaire.adresse.complement}
                      onChange={(e) => handleInputChange('section_proprietaire.adresse.complement', e.target.value)}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Ville"
                        className={fieldCls('section_proprietaire.adresse.ville')}
                        {...lockExtra('section_proprietaire.adresse.ville')}
                        value={formData.section_proprietaire.adresse.ville}
                        onChange={(e) => handleInputChange('section_proprietaire.adresse.ville', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Code postal"
                        className={fieldCls('section_proprietaire.adresse.codePostal')}
                        {...lockExtra('section_proprietaire.adresse.codePostal')}
                        value={formData.section_proprietaire.adresse.codePostal}
                        onChange={(e) => handleInputChange('section_proprietaire.adresse.codePostal', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
            {/* Boutons navigation standardisés */}
            <NavigationButtons />
          </div>
        </div>
      </div>
    </div>
  )
}