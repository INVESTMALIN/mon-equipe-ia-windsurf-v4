import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles, Facebook, Instagram, Calendar, TrendingUp, FileText, Image, Video, MessageCircle, Lightbulb, CheckCircle, AlertTriangle, Palette, Info } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { getUserBrandCharter } from '../lib/supabaseHelpers'
import BrandCharterWizard from './BrandCharterWizard'
import CharterSummaryCard from './CharterSummaryCard'
import HowItWorksDrawer from './HowItWorksDrawer'


export default function AssistantCommunication() {
  const [userId, setUserId] = useState(null)
  const [charter, setCharter] = useState(null)
  const [showWizard, setShowWizard] = useState(false)
  const [loadingCharter, setLoadingCharter] = useState(true)
  const [showChatSidebar, setShowChatSidebar] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false) // ← AJOUTER

  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    initUser()
  }, [])

  // Charger la charte
  useEffect(() => {
    const loadCharter = async () => {
      if (!userId) return
      
      try {
        setLoadingCharter(true)
        const data = await getUserBrandCharter(userId)
        
        if (data) {
          setCharter(data)
          setShowWizard(false)
        } else {
          setShowWizard(true)
        }
      } catch (error) {
        console.error('Erreur chargement charte:', error)
        setShowWizard(true)
      } finally {
        setLoadingCharter(false)
      }
    }
    
    loadCharter()
  }, [userId])

  // Fake data pour le prototype
  const insights = [
    { type: 'warning', icon: AlertTriangle, text: 'Votre bio Instagram manque de CTA', action: 'Améliorer' },
    { type: 'success', icon: CheckCircle, text: 'Vos couleurs sont cohérentes', action: null },
    { type: 'info', icon: Lightbulb, text: 'Publiez entre 18h-20h pour plus d\'engagement', action: 'Planifier' },
  ]

  const quickActions = [
    { icon: Facebook, label: 'Post Facebook', color: 'from-blue-600 to-blue-700', description: 'Créer un post optimisé' },
    { icon: Instagram, label: 'Story Instagram', color: 'from-pink-600 to-purple-700', description: 'Générer une story' },
    { icon: FileText, label: 'Carrousel', color: 'from-orange-600 to-red-700', description: 'Post multi-slides' },
    { icon: Calendar, label: 'Planifier', color: 'from-green-600 to-emerald-700', description: 'Calendrier éditorial' },
    { icon: Image, label: 'Suggestions visuelles', color: 'from-purple-600 to-indigo-700', description: 'Idées de photos' },
    { icon: TrendingUp, label: 'Analyser mes posts', color: 'from-teal-600 to-cyan-700', description: 'Performance actuelle' },
  ]

  const recentContent = [
    { type: 'Facebook', date: '2025-11-10', status: 'Publié', preview: 'Découvrez nos nouveaux logements...' },
    { type: 'Instagram', date: '2025-11-09', status: 'Planifié', preview: '✨ Week-end parfait à Lyon...' },
    { type: 'Facebook', date: '2025-11-08', status: 'Brouillon', preview: 'Témoignage client : "Excellent séjour"...' },
  ]

  if (loadingCharter) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#dbae61] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }
  
  if (showWizard) {
    return (
    <BrandCharterWizard 
    userId={userId}
    onComplete={() => {
        getUserBrandCharter(userId).then(data => {
        setCharter(data)
        setShowWizard(false)
        })
    }}
    onCancel={() => setShowWizard(false)}  // ← AJOUTER ICI
    />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
{/* Header */}
<div className="bg-white border-b border-gray-200 sticky top-0 z-10">
  <div className="max-w-7xl mx-auto px-6 py-4">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <Link to="/assistants" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#dbae61] to-[#c49a4f] rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Assistant Communication</h1>
            <p className="text-xs text-gray-500">Créez du contenu pour vos réseaux</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
            <button
            onClick={() => setShowHowItWorks(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-600 hover:text-[#dbae61]"
            title="Comment ça marche ?"
        >
            <Info className="w-5 h-5" />
        </button>
        <button
            onClick={() => setShowChatSidebar(!showChatSidebar)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-600 hover:text-[#dbae61]"
            title="Chat IA"
        >
            <MessageCircle className="w-5 h-5" />
            Chat IA
        </button>
        </div>
    </div>

    {/* Utiliser le composant existant */}
    <CharterSummaryCard 
      charter={charter}
      onEdit={() => setShowWizard(true)}
    />
  </div>
</div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Insights Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Insights & Recommandations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  insight.type === 'warning' ? 'bg-orange-50 border-orange-200' :
                  insight.type === 'success' ? 'bg-green-50 border-green-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <insight.icon className={`w-5 h-5 flex-shrink-0 ${
                    insight.type === 'warning' ? 'text-orange-600' :
                    insight.type === 'success' ? 'text-green-600' :
                    'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 mb-2">{insight.text}</p>
                    {insight.action && (
                      <button className="text-xs font-medium text-[#dbae61] hover:text-[#c49a4f] transition-colors">
                        {insight.action} →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⚡ Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                className="group relative overflow-hidden bg-white border-2 border-gray-200 hover:border-[#dbae61] rounded-xl p-6 transition-all duration-300 hover:shadow-lg text-left"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="relative">
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{action.label}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Content */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">📝 Contenus récents</h2>
            <button className="text-sm text-[#dbae61] hover:text-[#c49a4f] font-medium transition-colors">
              Voir tout →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentContent.map((content, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {content.type === 'Facebook' ? (
                      <Facebook className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Instagram className="w-4 h-4 text-pink-600" />
                    )}
                    <span className="text-xs font-medium text-gray-900">{content.type}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    content.status === 'Publié' ? 'bg-green-100 text-green-700' :
                    content.status === 'Planifié' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {content.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{content.preview}</p>
                <p className="text-xs text-gray-500">{content.date}</p>
              </div>
            ))}
          </div>

          {/* Empty state si pas de contenu */}
          {recentContent.length === 0 && (
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun contenu créé</h3>
              <p className="text-gray-600 mb-4">Commencez par créer votre premier post !</p>
              <button className="px-6 py-2 bg-[#dbae61] hover:bg-[#c49a4f] text-white rounded-lg font-medium transition-colors">
                Créer un post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Sidebar (collapse) */}
      {showChatSidebar && (
        <div className="fixed right-0 top-0 h-screen w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Chat IA</h3>
            <button
              onClick={() => setShowChatSidebar(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="text-center text-gray-500 text-sm mt-8">
              💬 Posez vos questions ici...
              <br />
              <span className="text-xs text-gray-400">(Chat IA à implémenter)</span>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200">
            <input
              type="text"
              placeholder="Posez votre question..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dbae61]"
            />
          </div>
        </div>
      )}
      {showHowItWorks && (
        <HowItWorksDrawer
          isOpen={showHowItWorks}
          onClose={() => setShowHowItWorks(false)}
          assistantName="Communication"
        />
      )}
    </div>
  )
}