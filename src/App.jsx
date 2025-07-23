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
import AssistantFormationWithHistory from './components/AssistantFormationWithHistory'
import AssistantFormationWithHistoryV3 from './components/AssistantFormationWithHistory-v3'

// Import des pages légales
import FAQ from './components/FAQ'
import MentionsLegales from './components/MentionsLegales'
import PolitiqueConfidentialite from './components/PolitiqueConfidentialite'
import ConditionsUtilisation from './components/ConditionsUtilisation'
import MonCompteV2 from './components/MonCompte-v2'

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
          <Route path="/mon-compte" element={<MonCompte />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
          
          {/* Assistant Formation (gratuit) */}
          <Route path="/mon-compte/assistant-formation" element={<AssistantFormation />} />
          <Route path="/mon-compte/assistant-formation-v2" element={<AssistantFormationWithHistory />} />
          <Route path="/mon-compte/assistant-formation-v3" element={<AssistantFormationWithHistoryV3 />} />
          
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
          <Route path="/mon-compte-v2" element={<MonCompteV2 />} />
          
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