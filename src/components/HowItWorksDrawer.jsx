import { X, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function HowItWorksDrawer({ isOpen, onClose, activeAssistant = 'guide-acces' }) {
  const [activeTab, setActiveTab] = useState(activeAssistant)

  // Mettre à jour l'onglet actif quand le drawer s'ouvre avec un nouvel assistant
  useEffect(() => {
    if (isOpen) {
      setActiveTab(activeAssistant)
    }
  }, [isOpen, activeAssistant])

  const assistants = [
    { id: 'guide-acces', name: "Guide d'Accès" },
    { id: 'annonce', name: 'Annonce' },
    { id: 'juridique', name: 'LegalBNB' },
    { id: 'negociateur', name: 'Négociateur' },
    { id: 'transcript', name: 'Transcript' },
    { id: 'communication', name: 'Communication' }
  ]

  const content = {
    'guide-acces': (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Comment fonctionne l'Assistant Guide d'Accès ?</h3>
            <p className="text-gray-700 leading-relaxed">
                L'Assistant Guide d'Accès transforme vos enregistrements audio (ou vidéos) en guides d'accès professionnels pour vos voyageurs. 
                <strong> L'audio est fortement recommandé</strong> car l'assistant ne voit pas les images, il analyse uniquement ce que vous dites. 
                Enregistrez-vous en décrivant le chemin depuis un point identifiable dans la rue (panneau, commerce, arrêt de bus) jusqu'à la porte 
                de l'appartement. Parlez comme si vous guidiez quelqu'un au téléphone : soyez précis, mentionnez tous les détails visuels, 
                les directions, les codes, etc.
            </p>
        </div>

        <div className="bg-[#dbae61] bg-opacity-10 border border-[#dbae61] rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-[#dbae61]">💡</span>
            Feature clé : Enrichir avec une Fiche Logement
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed">
            Pour un guide encore plus complet, utilisez le bouton <strong>Ajouter &gt; Sélectionner une fiche</strong> pour ajouter 
            le contexte de votre Fiche Logement. L'assistant intègrera automatiquement les informations importantes comme l'adresse exacte, 
            le code d'accès, l'emplacement des clés, le Wi-Fi, le parking, et bien plus encore.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Étapes d'utilisation</h4>
          <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
              <div>
                <strong>Enregistrez votre vidéo ou audio</strong>
                <p className="text-sm text-gray-600 mt-1">
                  Filmez le chemin d'accès depuis un point repérable (arrêt de bus, commerce, etc.) jusqu'à la porte du logement. 
                  Parlez clairement et mentionnez les détails importants.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
              <div>
                <strong>Uploadez votre fichier</strong>
                <p className="text-sm text-gray-600 mt-1">
                  Cliquez sur le bouton <strong>Ajouter</strong> et sélectionnez votre vidéo (MP4, WebM, MOV jusqu'à 350MB) 
                  ou audio (MP3, WAV, M4A jusqu'à 10MB).
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
              <div>
                <strong>Ajoutez une Fiche Logement (Recommandé)</strong>
                <p className="text-sm text-gray-600 mt-1">
                  Cliquez sur <strong>Ajouter &gt; Sélectionner une fiche</strong>, puis choisissez votre fiche dans le menu déroulant. 
                  Cela enrichira considérablement le guide avec toutes les informations clés du logement.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">4</span>
              <div>
                <strong>Ajoutez des détails complémentaires</strong>
                <p className="text-sm text-gray-600 mt-1">
                  Dans le chat, précisez tout ce qui n'apparaît pas dans la vidéo : numéro d'appartement, étage, nombre de clés, 
                  consignes particulières, etc.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">5</span>
              <div>
                <strong>Récupérez votre guide</strong>
                <p className="text-sm text-gray-600 mt-1">
                  L'assistant génère un guide d'accès professionnel que vous pouvez copier et envoyer à vos voyageurs ou intégrer 
                  dans vos annonces.
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Fonctionnalités générales</h4>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#dbae61] mt-1">•</span>
              <span><strong>Historique des conversations :</strong> Retrouvez tous vos guides générés dans la barre latérale gauche.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#dbae61] mt-1">•</span>
              <span><strong>Quick prompts :</strong> Utilisez les suggestions de prompts pour accélérer vos demandes.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#dbae61] mt-1">•</span>
              <span><strong>Copie rapide :</strong> Bouton copier sur chaque réponse de l'assistant pour l'utiliser ailleurs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#dbae61] mt-1">•</span>
              <span><strong>Nouvelle conversation :</strong> Commencez un nouveau guide sans perdre les anciens.</span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">💡 Conseil pro</h4>
          <p className="text-sm text-gray-700">
            Pour un résultat optimal, combinez vidéo + fiche logement + détails dans le chat. L'assistant dispose alors de toutes 
            les informations nécessaires pour créer un guide vraiment complet et professionnel.
          </p>
        </div>
      </div>
    ),
    'annonce': (
    <div className="space-y-6">
        <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Comment fonctionne l'Assistant Annonce ?</h3>
        <p className="text-gray-700 leading-relaxed">
            L'Assistant Annonce transforme vos fiches logement en annonces attractives et optimisées pour maximiser vos réservations. 
            Uploadez simplement votre fiche (PDF ou DocX), ou décrivez votre logement directement dans le chat, et l'assistant 
            génère une annonce professionnelle adaptée aux plateformes de location courte durée (Airbnb, Booking, etc.).
        </p>
        </div>

        <div className="bg-[#dbae61] bg-opacity-10 border border-[#dbae61] rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-[#dbae61]">⚡</span>
            Gagnez du temps avec les Quick Prompts
        </h4>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
            Utilisez les boutons de suggestions rapides pour accélérer votre demande. Pas besoin de tout écrire à la main !
        </p>
        <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200">Crée une annonce attractive pour Airbnb</span>
            <span className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200">Optimise cette annonce</span>
            <span className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200">Génère un titre accrocheur</span>
        </div>
        </div>

        <div>
        <h4 className="font-semibold text-gray-900 mb-3">Étapes d'utilisation</h4>
        <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
            <div>
                <strong>Préparez votre document</strong>
                <p className="text-sm text-gray-600 mt-1">
                Utilisez votre Fiche Logement (PDF ou DocX jusqu'à 10MB) ou préparez un descriptif manuel du logement avec 
                les informations clés : emplacement, équipements, capacité, particularités, etc.
                </p>
            </div>
            </li>
            <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
            <div>
                <strong>Uploadez votre fiche ou décrivez votre logement</strong>
                <p className="text-sm text-gray-600 mt-1">
                Cliquez sur <strong>Fichier</strong> pour uploader votre document, ou écrivez directement dans le chat 
                les caractéristiques de votre logement si vous n'avez pas de fiche.
                </p>
            </div>
            </li>
            <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
            <div>
                <strong>Utilisez un Quick Prompt ou personnalisez</strong>
                <p className="text-sm text-gray-600 mt-1">
                Cliquez sur un des boutons de suggestions rapides (ex: "Crée une annonce attractive pour Airbnb") ou 
                formulez votre propre demande pour un résultat personnalisé.
                </p>
            </div>
            </li>
            <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">4</span>
            <div>
                <strong>Affinez et optimisez</strong>
                <p className="text-sm text-gray-600 mt-1">
                L'assistant génère votre annonce. Vous pouvez ensuite demander des ajustements : ton plus chaleureux, 
                mise en avant de certains équipements, optimisation SEO, génération d'un nouveau titre, etc.
                </p>
            </div>
            </li>
            <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">5</span>
            <div>
                <strong>Copiez et publiez</strong>
                <p className="text-sm text-gray-600 mt-1">
                Utilisez le bouton copier pour récupérer votre annonce et la publier directement sur Airbnb, Booking 
                ou toute autre plateforme.
                </p>
            </div>
            </li>
        </ol>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-green-600">✓</span>
            Ce que l'assistant fait
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• Structure professionnelle</li>
            <li>• Ton attractif et commercial</li>
            <li>• Optimisation SEO</li>
            <li>• Mise en valeur des atouts</li>
            <li>• Adaptation au public cible</li>
            </ul>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-blue-600">💡</span>
            Formats acceptés
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>PDF</strong> (recommandé)</li>
            <li>• <strong>DocX</strong> (Word)</li>
            <li>• <strong>Taille max :</strong> 10MB</li>
            <li>• Ou descriptif texte dans le chat</li>
            </ul>
        </div>
        </div>

        <div>
        <h4 className="font-semibold text-gray-900 mb-3">Fonctionnalités générales</h4>
        <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Historique des conversations :</strong> Retrouvez toutes vos annonces créées dans la barre latérale gauche.</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Quick prompts :</strong> Boutons de suggestions pour créer, optimiser ou générer des titres rapidement.</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Copie rapide :</strong> Bouton copier sur chaque réponse pour utiliser l'annonce ailleurs.</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Itération illimitée :</strong> Affinez autant que nécessaire jusqu'à obtenir l'annonce parfaite.</span>
            </li>
        </ul>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">💡 Conseil pro</h4>
        <p className="text-sm text-gray-700">
            Pour un résultat optimal, combinez votre fiche logement avec des demandes spécifiques dans le chat 
            (ex: "Mets l'accent sur la proximité du métro" ou "Ton chaleureux pour familles"). L'assistant s'adaptera 
            à vos besoins précis !
        </p>
        </div>
    </div>
    ),
    'juridique': (
    <div className="space-y-6">
        <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Comment fonctionne LegalBNB ?</h3>
        <p className="text-gray-700 leading-relaxed">
            LegalBNB est votre assistant juridique spécialisé en location courte durée. Il analyse vos documents réglementaires 
            (règlement de copropriété, règlement de mairie, arrêtés préfectoraux) et répond à vos questions juridiques en 
            s'appuyant sur une base de connaissances complète des textes de loi liés à l'immobilier locatif.
        </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-amber-600">⚖️</span>
            Ce que LegalBNB peut faire pour vous
        </h4>
        <ul className="text-sm text-gray-700 space-y-1">
            <li>• Analyser vos règlements de copropriété et identifier les restrictions</li>
            <li>• Vérifier la conformité réglementaire de votre projet de location</li>
            <li>• Répondre à vos questions sur les obligations fiscales et déclaratives</li>
            <li>• Interpréter les arrêtés municipaux et préfectoraux</li>
            <li>• Vous orienter sur les démarches administratives à suivre</li>
        </ul>
        </div>

        <div>
        <h4 className="font-semibold text-gray-900 mb-3">Étapes d'utilisation</h4>
        <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
            <div>
                <strong>Uploadez votre document (optionnel)</strong>
                <p className="text-sm text-gray-600 mt-1">
                Cliquez sur <strong>Fichier</strong> pour uploader votre règlement de copropriété, arrêté municipal, 
                ou tout autre document juridique (PDF ou DocX, max 10MB). L'assistant l'analysera et en extraira 
                les informations pertinentes pour votre situation.
                </p>
            </div>
            </li>
            <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
            <div>
                <strong>Posez votre question</strong>
                <p className="text-sm text-gray-600 mt-1">
                Utilisez les Quick Prompts ou formulez votre propre question. Soyez précis sur votre situation : 
                type de logement, localisation, projet de location, etc. Plus le contexte est détaillé, plus 
                la réponse sera adaptée.
                </p>
            </div>
            </li>
            <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
            <div>
                <strong>Obtenez une réponse sourcée</strong>
                <p className="text-sm text-gray-600 mt-1">
                LegalBNB vous fournit une réponse claire basée sur la réglementation en vigueur et votre document 
                si vous en avez uploadé un. Les sources sont citées pour que vous puissiez vérifier les informations.
                </p>
            </div>
            </li>
            <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">4</span>
            <div>
                <strong>Approfondissez si nécessaire</strong>
                <p className="text-sm text-gray-600 mt-1">
                Posez des questions de suivi pour clarifier certains points ou explorer d'autres aspects de votre 
                situation. L'assistant garde en mémoire le contexte de la conversation et les documents analysés.
                </p>
            </div>
            </li>
        </ol>
        </div>

        <div className="bg-[#dbae61] bg-opacity-10 border border-[#dbae61] rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-[#dbae61]">⚡</span>
            Questions fréquentes (Quick Prompts)
        </h4>
        <div className="flex flex-wrap gap-2 mt-3">
            <span className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200">Puis-je sous-louer mon appartement ?</span>
            <span className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200">Quelles sont mes obligations fiscales ?</span>
            <span className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200">Règlement de copropriété</span>
        </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-blue-600">📄</span>
            Documents analysables
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• Règlements de copropriété</li>
            <li>• Arrêtés municipaux</li>
            <li>• Arrêtés préfectoraux</li>
            <li>• Baux et contrats</li>
            <li>• PDF ou DocX (max 10MB)</li>
            </ul>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-purple-600">🔍</span>
            Sources de données
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• Base juridique Pinecone</li>
            <li>• Textes de loi officiels</li>
            <li>• Réglementation immobilière</li>
            <li>• Recherche internet si nécessaire</li>
            </ul>
        </div>
        </div>

        <div>
        <h4 className="font-semibold text-gray-900 mb-3">Fonctionnalités générales</h4>
        <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Historique des conversations :</strong> Retrouvez toutes vos consultations juridiques dans la barre latérale.</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Mémoire contextuelle :</strong> L'assistant se souvient des documents analysés dans la conversation en cours.</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Quick prompts :</strong> Questions fréquentes pour démarrer rapidement.</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Copie rapide :</strong> Bouton copier pour sauvegarder les réponses importantes.</span>
            </li>
        </ul>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            Important : Limites de l'assistant
        </h4>
        <p className="text-sm text-gray-700 mb-2">
            LegalBNB fournit des informations juridiques générales mais <strong>ne remplace pas un avocat</strong>. 
            Pour des situations complexes ou des décisions importantes, consultez toujours un professionnel du droit.
        </p>
        <p className="text-sm text-gray-700">
            Si l'assistant ne peut pas répondre après plusieurs tentatives, il vous orientera poliment vers un 
            interlocuteur humain qualifié.
        </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">💡 Conseil pro</h4>
        <p className="text-sm text-gray-700">
            Pour obtenir la réponse la plus précise possible, combinez l'upload de votre document réglementaire avec 
            une question détaillée incluant votre localisation et votre situation spécifique (propriétaire, locataire, 
            résidence principale ou secondaire, etc.).
        </p>
        </div>
    </div>
    ),
    'negociateur': (
    <div className="space-y-6">
        <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Comment fonctionne l'Assistant Négociateur ?</h3>
        <p className="text-gray-700 leading-relaxed">
            L'Assistant Négociateur est votre expert en stratégie commerciale immobilière, spécialisé dans la psychologie 
            comportementale et les techniques de persuasion éthiques. Il analyse vos échanges avec les prospects 
            (transcriptions d'appels, emails, messages) et vous fournit des stratégies de négociation personnalisées 
            basées sur le profil psychologique de votre interlocuteur.
        </p>
        </div>

        <div className="bg-[#dbae61] bg-opacity-10 border border-[#dbae61] rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-[#dbae61]">🎯</span>
            Ce que l'Assistant Négociateur vous apporte
        </h4>
        <ul className="text-sm text-gray-700 space-y-1">
            <li>• Identification du profil psychologique (DISC/MBTI) de votre prospect</li>
            <li>• Détection des signaux d'achat et points de résistance</li>
            <li>• Stratégies de réponse adaptées au profil comportemental</li>
            <li>• Scripts de dialogue prêts à l'emploi pour chaque situation</li>
            <li>• Gestion des objections avec techniques éprouvées (méthode FBI)</li>
            <li>• Création d'urgence éthique sans pression excessive</li>
        </ul>
        </div>

        <div>
        <h4 className="font-semibold text-gray-900 mb-3">Étapes d'utilisation</h4>
        <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
            <div>
                <strong>Uploadez votre échange (optionnel)</strong>
                <p className="text-sm text-gray-600 mt-1">
                Cliquez sur <strong>Fichier</strong> pour uploader une transcription d'appel, un échange d'emails, 
                une conversation WhatsApp (PDF ou DocX, max 10MB). Ou décrivez simplement la situation dans le chat 
                si vous n'avez pas de document.
                </p>
            </div>
            </li>
            <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
            <div>
                <strong>Décrivez votre contexte</strong>
                <p className="text-sm text-gray-600 mt-1">
                Utilisez les Quick Prompts ou expliquez votre situation : type de bien, historique de la négociation, 
                objections rencontrées, ce que vous cherchez à obtenir. Plus le contexte est riche, plus l'analyse 
                sera précise et les recommandations pertinentes.
                </p>
            </div>
            </li>
            <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
            <div>
                <strong>Recevez votre analyse stratégique</strong>
                <p className="text-sm text-gray-600 mt-1">
                L'assistant vous fournit une analyse structurée avec : synthèse de la situation, profil psychologique 
                du prospect (DISC/MBTI), forces et faiblesses de chaque partie, stratégie recommandée, scripts de 
                dialogue concrets, et points d'attention.
                </p>
            </div>
            </li>
            <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">4</span>
            <div>
                <strong>Testez et itérez</strong>
                <p className="text-sm text-gray-600 mt-1">
                Appliquez la stratégie proposée, puis revenez partager les résultats pour affiner l'approche. 
                L'assistant garde en mémoire l'historique de la négociation et adapte ses recommandations en fonction 
                de l'évolution de la situation.
                </p>
            </div>
            </li>
        </ol>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-purple-600">🧠</span>
            Profils psychologiques analysés
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>DISC :</strong> Dominant, Influent, Stable, Conforme</li>
            <li>• <strong>MBTI :</strong> 16 types de personnalité</li>
            <li>• Adaptation du langage et des arguments</li>
            <li>• Détection des motivations cachées</li>
            </ul>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-green-600">💬</span>
            Format de réponse structuré
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• 🎯 Synthèse (situation en 2-3 phrases)</li>
            <li>• 📊 Analyse (forces/faiblesses)</li>
            <li>• 🎪 Stratégie (approche recommandée)</li>
            <li>• 💬 Scripts (dialogues concrets)</li>
            <li>• ⚠️ Points d'attention (pièges)</li>
            <li>• 📈 Plan d'action (étapes)</li>
            </ul>
        </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-blue-600">⚡</span>
            Quick Prompts disponibles
        </h4>
        <div className="flex flex-wrap gap-2 mt-3">
            <span className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200">Analyse de négociation</span>
            <span className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200">Stratégie de réponse</span>
            <span className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200">Modèle d'email</span>
        </div>
        </div>

        <div>
        <h4 className="font-semibold text-gray-900 mb-3">Techniques de négociation maîtrisées</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Ancrage psychologique :</strong> Poser les bonnes bases dès le début</span>
            </div>
            <div className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Méthode FBI :</strong> Gestion avancée des objections</span>
            </div>
            <div className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Questions calibrées :</strong> Discovery approfondi des besoins</span>
            </div>
            <div className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Urgence éthique :</strong> Créer le momentum sans pression</span>
            </div>
        </div>
        </div>

        <div>
        <h4 className="font-semibold text-gray-900 mb-3">Documents analysables</h4>
        <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Transcriptions d'appels :</strong> Outil recommandé : Assistant Transcript</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Échanges emails :</strong> Historique complet de la conversation</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Messages WhatsApp/SMS :</strong> Export de la discussion</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Contrats/Offres :</strong> Analyse des conditions et leviers de négociation</span>
            </li>
        </ul>
        </div>

        <div>
        <h4 className="font-semibold text-gray-900 mb-3">Fonctionnalités générales</h4>
        <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Historique des négociations :</strong> Suivi de toutes vos situations dans la barre latérale.</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Mémoire contextuelle :</strong> Continuité parfaite dans les négociations longues.</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Quick prompts :</strong> Démarrage rapide avec des demandes types.</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Copie rapide :</strong> Sauvegarde facile des scripts et stratégies.</span>
            </li>
        </ul>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">💡 Conseil pro</h4>
        <p className="text-sm text-gray-700 mb-2">
            Pour une analyse optimale, combinez la transcription ou l'échange écrit avec un maximum de contexte : 
            historique de la relation, enjeux financiers, délais, concurrence, particularités du prospect.
        </p>
        <p className="text-sm text-gray-700">
            <strong>Éthique :</strong> L'assistant privilégie toujours les approches win-win et la transparence. 
            L'objectif est une satisfaction durable de toutes les parties, pas une manipulation.
        </p>
        </div>
    </div>
    ),
    'transcript': (
    <div className="space-y-6">
        <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Comment fonctionne l'Assistant Transcription ?</h3>
        <p className="text-gray-700 leading-relaxed">
            L'Assistant Transcription convertit automatiquement vos fichiers audio et vidéo en texte. Uploadez votre fichier, 
            et recevez la transcription complète par email dans les minutes qui suivent. Cet outil est conçu pour être utilisé 
            en collaboration avec les autres assistants (Négociateur, Guide d'Accès, etc.).
        </p>
        </div>

        <div className="bg-[#dbae61] bg-opacity-10 border border-[#dbae61] rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-[#dbae61]">🎯</span>
            Interface simple et directe
        </h4>
        <p className="text-sm text-gray-700 mb-2">
            Contrairement aux autres assistants, l'Assistant Transcription n'a pas de chat. C'est une page d'upload dédiée :
        </p>
        <ul className="text-sm text-gray-700 space-y-1">
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61]">•</span>
            <span>Zone de glisser-déposer (drag drop) pour les fichiers</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61]">•</span>
            <span>Upload direct par clic sur la zone</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61]">•</span>
            <span>Envoi instantané vers le serveur de transcription</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61]">•</span>
            <span>Réception par email à votre adresse enregistrée</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61]">•</span>
            <span>Historique des 10 derniers envois</span>
            </li>
        </ul>
        </div>

        <div>
        <h4 className="font-semibold text-gray-900 mb-3">Étapes d'utilisation</h4>
        <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
            <div>
                <strong>Glissez-déposez votre fichier</strong>
                <p className="text-sm text-gray-600 mt-1">
                Faites glisser votre fichier audio ou vidéo dans la zone de dépôt, ou cliquez pour sélectionner 
                un fichier depuis votre ordinateur. La zone devient verte quand le fichier est prêt.
                </p>
            </div>
            </li>
            <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
            <div>
                <strong>Vérifiez votre email de réception</strong>
                <p className="text-sm text-gray-600 mt-1">
                Votre adresse email est affichée en haut de la page. C'est à cette adresse que vous recevrez 
                la transcription. Assurez-vous qu'elle est correcte avant d'envoyer.
                </p>
            </div>
            </li>
            <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
            <div>
                <strong>Cliquez sur "Envoyer pour transcription"</strong>
                <p className="text-sm text-gray-600 mt-1">
                Le fichier est immédiatement envoyé au serveur de transcription. Vous verrez une confirmation 
                à l'écran et l'envoi sera ajouté à votre historique en bas de page.
                </p>
            </div>
            </li>
            <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-[#dbae61] text-white rounded-full flex items-center justify-center text-sm font-semibold">4</span>
            <div>
                <strong>Recevez la transcription par email</strong>
                <p className="text-sm text-gray-600 mt-1">
                Le délai dépend de la taille et de la durée du fichier : quelques minutes pour les fichiers courts, 
                jusqu'à 10 minutes pour les fichiers lourds. Consultez votre boîte email (et les spams si besoin).
                </p>
            </div>
            </li>
        </ol>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-purple-600">🎵</span>
            Formats audio acceptés
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li className="flex items-start gap-2">
                <span className="text-[#dbae61]">•</span>
                <span>MP3</span>
            </li>
            <li className="flex items-start gap-2">
                <span className="text-[#dbae61]">•</span>
                <span>WAV</span>
            </li>
            <li className="flex items-start gap-2">
                <span className="text-[#dbae61]">•</span>
                <span>M4A</span>
            </li>
            <li className="flex items-start gap-2">
                <span className="text-[#dbae61]">•</span>
                <span>WebM (audio)</span>
            </li>
            <li className="flex items-start gap-2">
                <span className="text-[#dbae61]">•</span>
                <span><strong>Taille max :</strong> 10MB</span>
            </li>
            </ul>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-blue-600">🎬</span>
            Formats vidéo acceptés
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li className="flex items-start gap-2">
                <span className="text-[#dbae61]">•</span>
                <span>MP4</span>
            </li>
            <li className="flex items-start gap-2">
                <span className="text-[#dbae61]">•</span>
                <span>WebM (vidéo)</span>
            </li>
            <li className="flex items-start gap-2">
                <span className="text-[#dbae61]">•</span>
                <span><strong>Taille max :</strong> 350MB</span>
            </li>
            <li className="flex items-start gap-2">
                <span className="text-[#dbae61]">•</span>
                <span>Seul l'audio est transcrit</span>
            </li>
            </ul>
        </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-green-600">🤝</span>
            Utilisation collaborative avec les autres assistants
        </h4>
        <p className="text-sm text-gray-700 mb-2">
            L'Assistant Transcription est conçu pour travailler avec les autres assistants :
        </p>
        <ul className="text-sm text-gray-700 space-y-1">
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61]">•</span>
            <span><strong>Assistant Négociateur :</strong> Transcrivez vos appels commerciaux, puis uploadez la transcription pour obtenir une analyse stratégique</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61]">•</span>
            <span><strong>Assistant Guide d'Accès :</strong> Transcrivez vos explications orales, puis intégrez le texte dans le guide final</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61]">•</span>
            <span><strong>Tout autre usage :</strong> Transcriptions de réunions, notes vocales, podcasts, etc.</span>
            </li>
        </ul>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-orange-600">⏱️</span>
            Temps de traitement
        </h4>
        <p className="text-sm text-gray-700 mb-2">
            Le délai de transcription varie selon la taille et la durée de votre fichier :
        </p>
        <ul className="text-sm text-gray-700 space-y-1">
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61]">•</span>
            <span><strong>Fichiers courts (moins de 5 min) :</strong> 2-3 minutes</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61]">•</span>
            <span><strong>Fichiers moyens (5-15 min) :</strong> 3-7 minutes</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61]">•</span>
            <span><strong>Fichiers longs (15-30 min) :</strong> 7-10 minutes</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61]">•</span>
            <span><strong>Fichiers très longs :</strong> Jusqu'à 15 minutes</span>
            </li>
        </ul>
        <p className="text-sm text-gray-700 mt-2">
            Si vous ne recevez rien après 15 minutes, vérifiez vos spams ou contactez le support.
        </p>
        </div>

        <div>
        <h4 className="font-semibold text-gray-900 mb-3">Fonctionnalités de la page</h4>
        <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Glisser déposer :</strong> Glissez directement votre fichier dans la zone, pas besoin de cliquer.</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Validation automatique :</strong> Le système vérifie le format et la taille avant l'envoi.</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Aperçu du fichier :</strong> Nom et taille affichés avant envoi, possibilité d'annuler.</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Historique des envois :</strong> Visualisez vos 10 derniers envois avec date et heure.</span>
            </li>
            <li className="flex items-start gap-2">
            <span className="text-[#dbae61] mt-1">•</span>
            <span><strong>Notifications toast :</strong> Confirmation visuelle immédiate après l'envoi.</span>
            </li>
        </ul>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">💡 Conseil pro</h4>
        <p className="text-sm text-gray-700 mb-2">
            Pour une transcription de meilleure qualité, privilégiez les fichiers audio aux vidéos (plus léger et plus 
            rapide à traiter). Assurez-vous que l'enregistrement est de bonne qualité : peu de bruit de fond, voix claire, 
            bon micro.
        </p>
        <p className="text-sm text-gray-700">
            <strong>Workflow recommandé :</strong> Transcription → Copier le texte de l'email → Coller dans Assistant 
            Négociateur ou Guide d'Accès pour analyse ou intégration.
        </p>
        </div>
    </div>
    ),
'communication': (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Comment fonctionne l'Assistant Communication ?</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        L'Assistant Communication vous aide à créer du contenu professionnel pour vos réseaux sociaux en s'appuyant sur votre identité de marque.
      </p>
    </div>

    <div className="bg-gradient-to-r from-[#dbae61]/10 to-[#c49a4f]/10 border border-[#dbae61]/30 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-[#dbae61]" />
        Première utilisation : Définir votre identité de marque
      </h4>
      <p className="text-sm text-gray-700 leading-relaxed">
        Lors de votre première connexion, un wizard vous guide pour définir votre style, ton de communication, couleurs de marque et audience cible. Ces informations permettent à l'IA de générer du contenu personnalisé et cohérent avec votre image.
      </p>
    </div>

    <div>
      <h4 className="font-semibold text-gray-900 mb-3">📊 Insights & Recommandations</h4>
      <p className="text-gray-700 mb-3">
        Le dashboard affiche des recommandations personnalisées pour améliorer votre présence en ligne :
      </p>
      <ul className="space-y-2">
        <li className="flex items-start gap-2">
          <span className="text-[#dbae61] font-bold mt-1">•</span>
          <span className="text-gray-700">Analyse de votre bio et suggestions d'amélioration</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#dbae61] font-bold mt-1">•</span>
          <span className="text-gray-700">Meilleurs moments pour publier selon votre audience</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#dbae61] font-bold mt-1">•</span>
          <span className="text-gray-700">Validation de la cohérence visuelle de votre marque</span>
        </li>
      </ul>
    </div>

    <div>
      <h4 className="font-semibold text-gray-900 mb-3">⚡ Actions rapides</h4>
      <p className="text-gray-700 mb-3">
        Créez du contenu optimisé en quelques clics :
      </p>
      <ul className="space-y-2">
        <li className="flex items-start gap-2">
          <span className="text-[#dbae61] font-bold mt-1">•</span>
          <span className="text-gray-700"><strong>Post Facebook/Instagram</strong> : Générez du texte et des suggestions visuelles adaptées à votre style</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#dbae61] font-bold mt-1">•</span>
          <span className="text-gray-700"><strong>Stories</strong> : Créez des stories engageantes avec le bon ton</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#dbae61] font-bold mt-1">•</span>
          <span className="text-gray-700"><strong>Carrousels</strong> : Posts multi-slides pour raconter une histoire</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#dbae61] font-bold mt-1">•</span>
          <span className="text-gray-700"><strong>Planification</strong> : Organisez votre calendrier éditorial mensuel</span>
        </li>
      </ul>
    </div>

    <div>
      <h4 className="font-semibold text-gray-900 mb-3">📝 Bibliothèque de contenus</h4>
      <p className="text-gray-700 leading-relaxed">
        Tous vos contenus générés sont sauvegardés et accessibles dans la section "Contenus récents". Vous pouvez les télécharger, les modifier ou les planifier pour publication ultérieure.
      </p>
    </div>

    <div>
      <h4 className="font-semibold text-gray-900 mb-3">💬 Chat IA pour questions rapides</h4>
      <p className="text-gray-700 leading-relaxed">
        Une sidebar de chat est disponible pour poser des questions spécifiques sur votre stratégie de communication, demander des conseils ou affiner un contenu déjà généré.
      </p>
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-semibold text-blue-900 mb-2">💡 Astuce</h4>
      <p className="text-sm text-blue-800 leading-relaxed">
        Plus votre identité de marque est détaillée (logo, couleurs, description), plus le contenu généré sera personnalisé et cohérent. N'hésitez pas à mettre à jour votre charte régulièrement !
      </p>
    </div>
  </div>
)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-in-out overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#dbae61] to-[#c49a4f] text-white p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Comment ça marche ?</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white px-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {assistants.map((assistant) => (
              <button
                key={assistant.id}
                onClick={() => setActiveTab(assistant.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === assistant.id
                    ? 'text-[#dbae61] border-b-2 border-[#dbae61]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {assistant.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {content[activeTab]}
        </div>
      </div>
    </>
  )
}