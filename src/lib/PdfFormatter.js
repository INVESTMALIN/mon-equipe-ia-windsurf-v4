// src/lib/PdfFormatter.js
import { cleanFormData, extractSummary, validateDataConsistency } from './DataProcessor'

/**
 * Formate les données de fiche pour génération PDF
 * RESPECTE EXACTEMENT les 23 sections du formulaire pour compatibilité n8n
 */

/**
 * Structure principale pour PDF - FIDÈLE aux 23 sections
 * Nettoie et enrichit les données sans changer la structure
 */
export const formatForPdf = (formData) => {
  const cleanedData = cleanFormData(formData)
  const summary = extractSummary(formData)
  const validation = validateDataConsistency(formData)
  
  return {
    // Métadonnées pour le workflow n8n
    metadata: {
      titre_document: generatePdfTitle(formData),
      date_generation: new Date().toISOString(),
      statut_fiche: cleanedData.statut || 'Brouillon',
      completion_pourcentage: summary.stats.pourcentage_completion,
      sections_completees: summary.stats.sections_remplies,
      total_sections: summary.stats.total_sections,
      hash_donnees: generateDataHash(cleanedData),
      version_formatter: '1.0'
    },

    // LES 23 SECTIONS EXACTES - même ordre que FormContext
    sections: {
      // Section 1 - Propriétaire
      section_proprietaire: enrichSection(cleanedData.section_proprietaire, 'proprietaire'),
      
      // Section 2 - Logement  
      section_logement: enrichSection(cleanedData.section_logement, 'logement'),
      
      // Section 3 - Avis
      section_avis: enrichSection(cleanedData.section_avis, 'avis'),
      
      // Section 4 - Clefs
      section_clefs: enrichSection(cleanedData.section_clefs, 'clefs'),
      
      // Section 5 - Airbnb
      section_airbnb: enrichSection(cleanedData.section_airbnb, 'airbnb'),
      
      // Section 6 - Booking
      section_booking: enrichSection(cleanedData.section_booking, 'booking'),
      
      // Section 7 - Réglementation
      section_reglementation: enrichSection(cleanedData.section_reglementation, 'reglementation'),
      
      // Section 8 - Exigences
      section_exigences: enrichSection(cleanedData.section_exigences, 'exigences'),
      
      // Section 9 - Gestion Linge
      section_gestion_linge: enrichSection(cleanedData.section_gestion_linge, 'linge'),
      
      // Section 10 - Équipements
      section_equipements: enrichSection(cleanedData.section_equipements, 'equipements'),
      
      // Section 11 - Consommables
      section_consommables: enrichSection(cleanedData.section_consommables, 'consommables'),
      
      // Section 12 - Visite
      section_visite: enrichSection(cleanedData.section_visite, 'visite'),
      
      // Section 13 - Chambres
      section_chambres: enrichSection(cleanedData.section_chambres, 'chambres'),
      
      // Section 14 - Salle de Bains
      section_salle_de_bains: enrichSection(cleanedData.section_salle_de_bains, 'sdb'),
      
      // Section 15 - Cuisine 1
      section_cuisine_1: enrichSection(cleanedData.section_cuisine_1, 'cuisine1'),
      
      // Section 16 - Cuisine 2
      section_cuisine_2: enrichSection(cleanedData.section_cuisine_2, 'cuisine2'),
      
      // Section 17 - Salon SAM
      section_salon_sam: enrichSection(cleanedData.section_salon_sam, 'salon'),
      
      // Section 18 - Équipements Extérieur
      section_equip_exterieur: enrichSection(cleanedData.section_equip_exterieur, 'exterieur'),
      
      // Section 19 - Communs
      section_communs: enrichSection(cleanedData.section_communs, 'communs'),
      
      // Section 20 - Télétravail
      section_teletravail: enrichSection(cleanedData.section_teletravail, 'teletravail'),
      
      // Section 21 - Bébé
      section_bebe: enrichSection(cleanedData.section_bebe, 'bebe'),
      
      // Section 22 - Guide Accès
      section_guide_acces: enrichSection(cleanedData.section_guide_acces, 'guide'),
      
      // Section 23 - Sécurité
      section_securite: enrichSection(cleanedData.section_securite, 'securite')
    },

    // Données analytiques pour enrichir le PDF
    analytics: {
      resume_logement: generateResumeLogement(cleanedData),
      points_forts: extractPointsForts(cleanedData),
      alertes_validation: validation.issues,
      recommandations: generateRecommandations(cleanedData),
      statistiques: summary.stats
    }
  }
}

/**
 * Enrichit une section avec des métadonnées sans changer sa structure
 */
const enrichSection = (sectionData, sectionType) => {
  if (!sectionData || typeof sectionData !== 'object') {
    return {
      donnees: {},
      meta_section: {
        vide: true,
        type: sectionType,
        derniere_modification: null
      }
    }
  }

  return {
    // Données originales INTACTES
    donnees: { ...sectionData },
    
    // Métadonnées enrichies pour le PDF
    meta_section: {
      vide: Object.keys(sectionData).length === 0,
      type: sectionType,
      nombre_champs_remplis: countFilledFields(sectionData),
      derniere_modification: sectionData.updated_at || null,
      taille_donnees: JSON.stringify(sectionData).length
    }
  }
}

/**
 * Compte les champs non vides dans une section
 */
const countFilledFields = (sectionData) => {
  if (!sectionData || typeof sectionData !== 'object') return 0
  
  return Object.values(sectionData).filter(value => {
    if (value === null || value === undefined || value === '') return false
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'object') return Object.keys(value).length > 0
    return true
  }).length
}

/**
 * Génère un résumé intelligent du logement
 */
const generateResumeLogement = (cleanedData) => {
  const logement = cleanedData.section_logement || {}
  const avis = cleanedData.section_avis || {}
  const proprietaire = cleanedData.section_proprietaire || {}
  
  return {
    titre_principal: logement.nom_logement || 'Logement sans nom',
    proprietaire: proprietaire.nom_proprietaire || 'Non renseigné',
    localisation: formatAdresse(logement.adresse_logement),
    caracteristiques_cles: {
      type: logement.type_propriete,
      surface: logement.surface ? `${logement.surface} m²` : null,
      capacite: logement.nombre_personnes_max,
      chambres: logement.nombre_chambres,
      note_globale: avis.note_globale
    },
    description_courte: avis.description_libre ? 
      avis.description_libre.substring(0, 300) + (avis.description_libre.length > 300 ? '...' : '') : null
  }
}

/**
 * Extrait les points forts du logement
 */
const extractPointsForts = (cleanedData) => {
  const avis = cleanedData.section_avis || {}
  const airbnb = cleanedData.section_airbnb || {}
  const booking = cleanedData.section_booking || {}
  
  return {
    atouts_declares: avis.atouts_logement || [],
    plateformes_actives: [
      airbnb.publication_airbnb === 'Oui' ? 'Airbnb' : null,
      booking.publication_booking === 'Oui' ? 'Booking' : null
    ].filter(Boolean),
    prix_airbnb: airbnb.prix_par_nuit,
    prix_booking: booking.prix_par_nuit
  }
}

/**
 * Génère des recommandations basées sur l'analyse
 */
const generateRecommandations = (cleanedData) => {
  const recommendations = []
  const logement = cleanedData.section_logement || {}
  const avis = cleanedData.section_avis || {}
  const equipements = cleanedData.section_equipements || {}
  
  // Analyse automatique pour recommandations
  if (!avis.atouts_logement || avis.atouts_logement.length < 3) {
    recommendations.push({
      type: 'marketing',
      priorite: 'moyenne',
      message: 'Ajouter plus d\'atouts pour améliorer l\'attractivité du logement'
    })
  }
  
  if (!logement.surface || logement.surface < 25) {
    recommendations.push({
      type: 'information',
      priorite: 'faible',
      message: 'Préciser la surface exacte pour rassurer les voyageurs'
    })
  }
  
  if (!avis.description_libre || avis.description_libre.length < 150) {
    recommendations.push({
      type: 'contenu',
      priorite: 'haute',
      message: 'Enrichir la description pour mieux présenter le logement'
    })
  }
  
  if (!equipements.wifi_disponible || equipements.wifi_disponible !== 'Oui') {
    recommendations.push({
      type: 'equipement',
      priorite: 'haute',
      message: 'Le WiFi est essentiel pour la plupart des voyageurs'
    })
  }
  
  return recommendations
}

/**
 * Formate une adresse de manière intelligente
 */
const formatAdresse = (adresse) => {
  if (!adresse) return 'Non renseignée'
  if (typeof adresse === 'string') return adresse
  
  const parts = []
  if (adresse.rue) parts.push(adresse.rue)
  if (adresse.code_postal && adresse.ville) {
    parts.push(`${adresse.code_postal} ${adresse.ville}`)
  } else {
    if (adresse.code_postal) parts.push(adresse.code_postal)
    if (adresse.ville) parts.push(adresse.ville)
  }
  
  return parts.join(', ') || 'Adresse incomplète'
}

/**
 * Génère un hash des données pour versioning
 */
const generateDataHash = (cleanedData) => {
  const dataString = JSON.stringify(cleanedData, Object.keys(cleanedData).sort())
  let hash = 0
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(36)
}

/**
 * Génère un titre intelligent pour le PDF
 */
export const generatePdfTitle = (formData) => {
  const proprietaire = formData.section_proprietaire || {}
  const logement = formData.section_logement || {}
  
  const nomLogement = (logement.nom_logement || 'Logement').replace(/[^a-zA-Z0-9\s]/g, '')
  const nomProprietaire = (proprietaire.nom_proprietaire || 'Proprietaire').replace(/[^a-zA-Z0-9\s]/g, '')
  const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  
  return `Fiche_${nomLogement.replace(/\s+/g, '_')}_${nomProprietaire.replace(/\s+/g, '_')}_${timestamp}`
}

/**
 * Prépare les données pour l'envoi au webhook n8n
 * Format exact attendu par le workflow de Kévin
 */
export const prepareForN8nWebhook = (formData) => {
  const pdfData = formatForPdf(formData)
  
  return {
    // Structure attendue par n8n
    type: 'generate_pdf',
    timestamp: new Date().toISOString(),
    
    // Métadonnées pour le workflow
    metadata: pdfData.metadata,
    
    // Les 23 sections dans leur format original enrichi
    fiche_data: pdfData.sections,
    
    // Analytics pour améliorer le PDF
    analytics: pdfData.analytics,
    
    // Configuration PDF
    pdf_config: {
      format: 'A4',
      orientation: 'portrait',
      langue: 'fr',
      template_version: '1.0'
    }
  }
}

/**
 * Fonction de debug - Aperçu de la structure pour validation
 */
export const debugPdfStructure = (formData) => {
  const pdfData = formatForPdf(formData)
  
  console.log('📄 Structure PDF générée:')
  console.log('- Métadonnées:', pdfData.metadata)
  console.log('- Sections remplies:', Object.keys(pdfData.sections).filter(key => 
    pdfData.sections[key] && !pdfData.sections[key].meta_section?.vide
  ).length)
  console.log('- Analytics:', pdfData.analytics)
  
  return {
    sections_overview: Object.keys(pdfData.sections).map(key => ({
      nom: key,
      vide: pdfData.sections[key].meta_section?.vide || false,
      champs_remplis: pdfData.sections[key].meta_section?.nombre_champs_remplis || 0
    })),
    resume: pdfData.analytics.resume_logement,
    recommandations: pdfData.analytics.recommandations
  }
}