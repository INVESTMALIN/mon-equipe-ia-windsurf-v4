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


// Import des pages légales
import FAQ from './components/FAQ'
import MentionsLegales from './components/MentionsLegales'
import PolitiqueConfidentialite from './components/PolitiqueConfidentialite'
import ConditionsUtilisation from './components/ConditionsUtilisation'


// Import paywall
import UpgradeRequired from './components/UpgradeRequired'
import ComingSoon from './components/ComingSoon'

function AppWrapper() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/compte-cree" element={<AccountCreated />} />
          
          {/* Mon Compte V1 -> Future page gestion abonnement */}
          <Route path="/mon-compte" element={<MonCompte />} />
          
          {/* Assistants - Ex Mon Compte V2 */}
          <Route path="/assistants" element={<Assistants />} />
          
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
          
          {/* Assistant Formation (gratuit) */}
          <Route path="/assistant-formation" element={<AssistantFormation />} />

          {/* Page Coming Soon générale depuis UpgradeRequired */}
          <Route path="/coming-soon" element={<ComingSoon />} />
          
          {/* Paywall */}
          <Route path="/upgrade" element={<UpgradeRequired />} />
          
          {/* Assistants Premium - Temporairement vers upgrade (en attendant les composants) */}
          <Route path="/fiscaliste" element={<ComingSoon assistant="fiscaliste" />} />
          <Route path="/legalbnb" element={<ComingSoon assistant="legalbnb" />} />
          <Route path="/negociateur" element={<ComingSoon assistant="negociateur" />} />
          
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          
          {/* Pages légales */}
          <Route path="/faq" element={<FAQ />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
          <Route path="/conditions-utilisation" element={<ConditionsUtilisation />} />
          
          <Route path="*" element={<NotFound />} />

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