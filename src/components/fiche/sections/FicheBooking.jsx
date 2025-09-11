import SidebarMenu from '../SidebarMenu'
import ProgressBar from '../ProgressBar'
import NavigationButtons from '../NavigationButtons'
import { useForm } from '../../FormContext'
import { Calendar } from 'lucide-react'

export default function FicheBooking() {
  const { 
    getField,
    updateField
  } = useForm()

  const formData = getField('section_booking')

  const handleInputChange = (field, value) => {
    updateField(field, value)
  }

  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        <ProgressBar />
        
        <div className="flex-1 p-6 bg-gray-100">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Booking</h1>
            
            <div className="bg-white rounded-xl shadow-sm p-8">
              
              {/* Header avec icône */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbae61] rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Configuration Booking</h2>
                    <p className="text-gray-600">Gestion du compte et de l'annonce Booking</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Annonce active sur Booking */}
                <div>
                  <label className="block font-medium text-gray-900 mb-3">
                    Le propriétaire a-t-il déjà une annonce active sur Booking ? *
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="annonce_active"
                        checked={formData.annonce_active === true}
                        onChange={() => handleInputChange('section_booking.annonce_active', true)}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                      />
                      <span>Oui</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="annonce_active"
                        checked={formData.annonce_active === false}
                        onChange={() => handleInputChange('section_booking.annonce_active', false)}
                        className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                      />
                      <span>Non</span>
                    </label>
                  </div>
                </div>

                {/* URL de l'annonce Booking */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">URL de l'annonce Booking</label>
                  <input
                    type="url"
                    placeholder="https://www.booking.com/hotel/fr/example.html"
                    value={formData.url_annonce || ''}
                    onChange={(e) => handleInputChange('section_booking.url_annonce', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                  />
                </div>

                {/* Section Codes de connexion */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">Codes de connexion au compte Booking du propriétaire</h3>
                  
                  <div className="mb-6">
                    <label className="block font-medium text-gray-900 mb-3">
                      Code Booking - Avez-vous obtenu les identifiants de connexion du propriétaire ?
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="identifiants_obtenus"
                          checked={formData.identifiants_obtenus === true}
                          onChange={() => handleInputChange('section_booking.identifiants_obtenus', true)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                        />
                        <span>Oui</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="identifiants_obtenus"
                          checked={formData.identifiants_obtenus === false}
                          onChange={() => handleInputChange('section_booking.identifiants_obtenus', false)}
                          className="w-4 h-4 text-[#dbae61] focus:ring-[#dbae61] cursor-pointer"
                        />
                        <span>Non</span>
                      </label>
                    </div>
                  </div>

                  {/* Affichage conditionnel selon la réponse */}
                  {formData.identifiants_obtenus === true && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          placeholder="email@exemple.com"
                          value={formData.email_compte || ''}
                          onChange={(e) => handleInputChange('section_booking.email_compte', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">
                          Mot de passe *
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={formData.mot_passe || ''}
                          onChange={(e) => handleInputChange('section_booking.mot_passe', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {formData.identifiants_obtenus === false && (
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        Code Booking - Veuillez expliquer pourquoi vous n'avez pas obtenu les identifiants *
                      </label>
                      <textarea
                        placeholder="Expliquez les raisons..."
                        value={formData.explication_refus || ''}
                        onChange={(e) => handleInputChange('section_booking.explication_refus', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61] focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons navigation standardisés */}
              <NavigationButtons />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}