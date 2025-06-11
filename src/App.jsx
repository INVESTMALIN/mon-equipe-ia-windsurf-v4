import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Login from './components/Login'
import AccountCreated from './components/AccountCreated'
import NotFound from './components/NotFound'
import MonCompte from './components/MonCompte'
import AssistantFormation from './components/AssistantFormation'
import Inscription from './components/Inscription'
import MotDePasseOublie from './components/MotDePasseOublie'
import EmailConfirmation from './components/EmailConfirmation'
import AssistantFormationWithHistory from './components/AssistantFormationWithHistory'

// Import des nouvelles pages légales
import FAQ from './components/FAQ'
import MentionsLegales from './components/MentionsLegales'
import PolitiqueConfidentialite from './components/PolitiqueConfidentialite'
import ConditionsUtilisation from './components/ConditionsUtilisation'

function AppWrapper() {
  const location = useLocation()
  const showNavbar = location.pathname.startsWith('/mon-compte')

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {showNavbar && <Navbar />}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/compte-cree" element={<AccountCreated />} />
            <Route path="/mon-compte" element={<MonCompte />} />
            <Route path="/inscription" element={<Inscription />} />
            <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
            <Route path="/mon-compte/assistant-formation" element={<AssistantFormation />} />
            <Route path="/mon-compte/assistant-formation-v2" element={<AssistantFormationWithHistory />} />
            <Route path="/email-confirmation" element={<EmailConfirmation />} />
            
            {/* Nouvelles routes pour les pages légales */}
            <Route path="/faq" element={<FAQ />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
            <Route path="/conditions-utilisation" element={<ConditionsUtilisation />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
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