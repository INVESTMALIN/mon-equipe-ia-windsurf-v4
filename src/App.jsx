// src/App.jsx - MISE À JOUR pour FicheWizard + Auth Redirect Handler
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './components/Home'
import Login from './components/Login'
import AccountCreated from './components/AccountCreated'
import NotFound from './components/NotFound'
import MonCompte from './components/MonCompte'
import AssistantFormation from './components/AssistantFormation'
import Inscription from './components/Inscription'
import MotDePasseOublie from './components/MotDePasseOublie'
import EmailConfirmation from './components/EmailConfirmation'
import Assistants from './components/Assistants'
import NouveauMotDePasse from './components/NouveauMotDePasse'
import Dashboard from './components/Dashboard'
import AssistantAnnonce from './components/AssistantAnnonce'
import AssistantJuridique from './components/AssistantJuridique'
import AssistantNegociateur from './components/AssistantNegociateur'
import TestStripe from './components/TestStripe'

import FicheWizard from './components/fiche/FicheWizard'
import { FormProvider } from './components/FormContext'

import ProtectedRoute from './components/ProtectedRoute'

import FAQ from './components/FAQ'
import MentionsLegales from './components/MentionsLegales'
import PolitiqueConfidentialite from './components/PolitiqueConfidentialite'
import ConditionsUtilisation from './components/ConditionsUtilisation'

import UpgradeRequired from './components/UpgradeRequired'
import ComingSoon from './components/ComingSoon'

import ScrollToTop from './components/ScrollToTop'

import Tarifs from './components/Tarifs'

import Support from './components/Support'

// Composant pour gérer les redirections après actions Supabase (recovery, invite, signup)
function AuthRedirectHandler() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Vérifier les paramètres dans l'URL après redirection Supabase
    const params = new URLSearchParams(location.search)
    const hashParams = new URLSearchParams(location.hash.substring(1))
    
    // Supabase peut mettre les params dans ?query ou #hash
    const type = params.get('type') || hashParams.get('type')

    if (type === 'recovery') {
      // Mot de passe oublié -> page de nouveau mot de passe
      navigate('/nouveau-mot-de-passe', { replace: true })
    } else if (type === 'signup') {
      // Confirmation email -> page de connexion avec message
      navigate('/connexion', { replace: true })
    } else if (type === 'invite') {
      // Invitation utilisateur -> page de connexion
      navigate('/connexion', { replace: true })
    }
  }, [location, navigate])

  return null
}

function AppWrapper() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-1">

      <ScrollToTop />
      <AuthRedirectHandler />
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/tarifs" element={<Tarifs />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/compte-cree" element={<AccountCreated />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
          <Route path="/nouveau-mot-de-passe" element={<NouveauMotDePasse />} />
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          <Route path="/support" element={<Support />} />

          
          {/* Pages légales - publiques */}
          <Route path="/faq" element={<FAQ />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
          <Route path="/conditions-utilisation" element={<ConditionsUtilisation />} />
          
          {/* 404 - publique */}
          <Route path="*" element={<NotFound />} />

          {/* Routes protégées gratuites - nécessitent une authentification */}
          <Route 
            path="/assistant-invest-malin" 
            element={
              <ProtectedRoute>
                <AssistantFormation />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/mon-compte" 
            element={
              <ProtectedRoute>
                <MonCompte />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/assistants" 
            element={
              <ProtectedRoute>
                <Assistants />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/upgrade" 
            element={
              <ProtectedRoute>
                <UpgradeRequired />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/coming-soon" 
            element={
              <ProtectedRoute>
                <ComingSoon />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requirePremium={true}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />       

          <Route
            path="/annonce"
            element={
              <ProtectedRoute requirePremium={true}>
                <AssistantAnnonce />
              </ProtectedRoute>
            }
          />  

          <Route
            path="/legalbnb"
            element={
              <ProtectedRoute requirePremium={true}>
                <AssistantJuridique />
              </ProtectedRoute>
            }
          />  

          <Route
            path="/negociateur"
            element={
              <ProtectedRoute requirePremium={true}>
                <AssistantNegociateur />
              </ProtectedRoute>
            }
          />  

          <Route 
            path="/fiche" 
            element={
              <ProtectedRoute requirePremium={true}>
                <FormProvider>
                  <FicheWizard />
                </FormProvider>
              </ProtectedRoute>
            } 
          />

          {/* 🔥 OPTION : Redirection de l'ancienne route vers la nouvelle */}
          <Route 
            path="/nouvelle-fiche" 
            element={
              <ProtectedRoute requirePremium={true}>
                <FormProvider>
                  <FicheWizard />
                </FormProvider>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/test-stripe" 
            element={
              <ProtectedRoute>
                <TestStripe />
              </ProtectedRoute>
            } 
          />

        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  )
}