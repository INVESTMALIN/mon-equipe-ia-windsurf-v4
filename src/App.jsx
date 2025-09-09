import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import FicheForm from './components/FicheForm'


// Import du nouveau ProtectedRoute
import ProtectedRoute from './components/ProtectedRoute'

// Import des pages légales
import FAQ from './components/FAQ'
import MentionsLegales from './components/MentionsLegales'
import PolitiqueConfidentialite from './components/PolitiqueConfidentialite'
import ConditionsUtilisation from './components/ConditionsUtilisation'

// Import paywall
import UpgradeRequired from './components/UpgradeRequired'
import ComingSoon from './components/ComingSoon'

// Test de l'assistant juridique
import TestAssistantJuridique from './components/TestAssistantJuridique'

function AppWrapper() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-1">
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/compte-cree" element={<AccountCreated />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
          <Route path="/nouveau-mot-de-passe" element={<NouveauMotDePasse />} />
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          
          {/* Pages légales - publiques */}
          <Route path="/faq" element={<FAQ />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
          <Route path="/conditions-utilisation" element={<ConditionsUtilisation />} />
          
          {/* 404 - publique */}
          <Route path="*" element={<NotFound />} />

          {/* Routes protégées - Toutes nécessitent une authentification */}
          <Route 
            path="/assistant-formation" 
            element={
              <ProtectedRoute>
                <AssistantFormation />
              </ProtectedRoute>
            } 
          />

          {/* Toutes les autres routes protégées */}
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
            path="/fiscaliste" 
            element={
              <ProtectedRoute>
                <ComingSoon assistant="fiscaliste" />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/legalbnb" 
            element={
              <ProtectedRoute>
                <ComingSoon assistant="legalbnb" />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/negociateur" 
            element={
              <ProtectedRoute>
                <ComingSoon assistant="negociateur" />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/test-juridique" 
            element={
              <ProtectedRoute>
                <TestAssistantJuridique />
              </ProtectedRoute>
            } 
          /> 

          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />         

          <Route path="/nouvelle-fiche" element={
            <ProtectedRoute>
              <FicheForm />
            </ProtectedRoute>
          } />

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