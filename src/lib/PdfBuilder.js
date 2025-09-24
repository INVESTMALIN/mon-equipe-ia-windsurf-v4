// src/lib/PdfBuilder.js
import { formatForPdf } from './PdfFormatter'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

// Initialiser les polices pour pdfmake (version robuste)
if (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs
} else {
  pdfMake.vfs = pdfFonts
}

/**
 * Génère un PDF lisible à partir des données de fiche
 * @param {Object} formData - Données brutes issues du formulaire
 */
export const generatePdfClientSide = (formData) => {
  const pdfData = formatForPdf(formData)
  const content = []

  // EN-TÊTE PROFESSIONNEL
  content.push({
    columns: [
      {
        text: 'FICHE LOGEMENT',
        style: 'logoText',
        alignment: 'left'
      },
      {
        text: new Date().toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        style: 'dateHeader',
        alignment: 'right'
      }
    ],
    margin: [0, 0, 0, 20]
  })

  // APERÇU RAPIDE - Infos clés (correction des chemins de données)
  const proprietaireData = pdfData.sections.section_proprietaire?.donnees || {}
  const logementData = pdfData.sections.section_logement?.donnees || {}
  const visiteData = pdfData.sections.section_visite?.donnees || {}
  const avisData = pdfData.sections.section_avis?.donnees || {}
  
  content.push({
    text: 'APERÇU DU LOGEMENT',
    style: 'sectionHeader',
    margin: [0, 10, 0, 10]
  })

  // Tableau récapitulatif avec bons chemins
  const tableData = [
    ['Propriétaire', [proprietaireData.nom, proprietaireData.prenom].filter(Boolean).join(' ') || 'Non renseigné'],
    ['Logement', logementData.nom_logement || proprietaireData.nom_logement || 'Non renseigné'],
    ['Adresse', formatAddress(proprietaireData.adresse)],
    ['Type', logementData.typologie || visiteData.typologie || 'Non renseigné'],
    ['Superficie', logementData.surface || visiteData.surface || 'Non renseignée'],
    ['Chambres', logementData.nombre_chambres || visiteData.nombre_chambres || 'Non renseigné'],
    ['Capacité', logementData.nombre_lits || visiteData.nombre_lits || 'Non renseignée'],
    ['État général', avisData.logement_etat_general ? formatEnumValue(avisData.logement_etat_general) : 'Non évalué']
  ]

  // Affichage conditionnel de la superficie
  tableData[4][1] = tableData[4][1] !== 'Non renseignée' ? `${tableData[4][1]} m²` : 'Non renseignée'
  tableData[6][1] = tableData[6][1] !== 'Non renseignée' ? `${tableData[6][1]} lits` : 'Non renseignée'

  content.push({
    table: {
      widths: ['30%', '70%'],
      body: tableData
    },
    style: 'summaryTable',
    margin: [0, 0, 0, 30]
  })

  // TITRE PRINCIPAL SECTIONS
  content.push({
    text: 'DÉTAIL DES SECTIONS',
    style: 'mainSectionTitle',
    margin: [0, 20, 0, 20]
  })

  // Parcourir les 23 sections
  Object.entries(pdfData.sections).forEach(([sectionKey, section]) => {
    if (section?.meta_section?.vide) return

    content.push({ 
      text: humanizeSectionTitle(sectionKey), 
      style: 'sectionHeader' 
    })

    // Séparer les éléments abîmés des autres champs
    const normalFields = {}
    const elementsAbimes = {}
    
    Object.entries(section.donnees).forEach(([field, value]) => {
      if (field.includes('elements_abimes')) {
        elementsAbimes[field] = value
      } else {
        normalFields[field] = value
      }
    })

    // Afficher d'abord les champs normaux
    Object.entries(normalFields).forEach(([field, value]) => {
      if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        return
      }

      content.push({
        text: `${humanizeKey(field)}: ${formatFieldValue(value, field)}`,
        style: 'field'
      })
    })

    // Puis afficher les éléments abîmés s'il y en a
    const abimesActifs = Object.entries(elementsAbimes)
      .filter(([field, value]) => value === true || value === 'Oui' || value === 'oui')
    
    if (abimesActifs.length > 0) {
      content.push({
        text: 'Éléments abîmés détectés :',
        style: 'damageHeader'
      })
      
      abimesActifs.forEach(([field, value]) => {
        const location = field.replace('_elements_abimes', '').replace(/_/g, ' ')
        content.push({
            text: `• ${formatGenericKey(location)}`,
          style: 'damageItem'
        })
      })
    }

    content.push({ text: '\n' })
  })

  const docDefinition = {
    content,
    styles: {
      logoText: { 
        fontSize: 22, 
        bold: true, 
        color: '#dbae61' 
      },
      dateHeader: { 
        fontSize: 10, 
        color: '#666666' 
      },
      mainSectionTitle: { 
        fontSize: 16, 
        bold: true, 
        color: '#333333',
        alignment: 'center' 
      },
      sectionHeader: { 
        fontSize: 14, 
        bold: true, 
        color: '#dbae61', 
        margin: [0, 15, 0, 8] 
      },
      field: { 
        fontSize: 10, 
        margin: [0, 2, 0, 2] 
      },
      summaryTable: {
        fontSize: 10
      },
      damageHeader: {
        fontSize: 11,
        bold: true,
        color: '#d97706',
        margin: [0, 5, 0, 3]
      },
      damageItem: {
        fontSize: 10,
        color: '#d97706',
        margin: [10, 1, 0, 1]
      }
    },
    defaultStyle: {
      fontSize: 12,
      font: 'Roboto'
    },
    // Définition des polices pour pdfMake
    fonts: {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Bold.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-BoldItalic.ttf'
      }
    }
  }

  // Génération et téléchargement du PDF
  const pdf = pdfMake.createPdf(docDefinition)
  pdf.download(pdfData.metadata.titre_document + '.pdf')
  
  // Alternative pour visualisation : pdf.open() 
  // (décommenter pour ouvrir dans un nouvel onglet)
  // pdf.open()
}

/**
 * Formate une adresse de manière lisible
 */
const formatAddress = (adresse) => {
  if (!adresse) return 'Non renseignée'
  if (typeof adresse === 'string') return adresse
  
  const parts = []
  if (adresse.rue) parts.push(adresse.rue)
  if (adresse.complement) parts.push(adresse.complement)
  if (adresse.codePostal && adresse.ville) {
    parts.push(`${adresse.codePostal} ${adresse.ville}`)
  } else {
    if (adresse.codePostal) parts.push(adresse.codePostal)
    if (adresse.ville) parts.push(adresse.ville)
  }
  
  return parts.join(', ') || 'Adresse incomplète'
}

/**
 * Humanise les titres de sections (GESTION_LINGE -> Gestion du linge)
 */
const humanizeSectionTitle = (sectionKey) => {
  const mapping = {
    section_proprietaire: 'Propriétaire',
    section_logement: 'Logement',
    section_avis: 'Avis et évaluation',
    section_clefs: 'Gestion des clés',
    section_airbnb: 'Configuration Airbnb',
    section_booking: 'Configuration Booking',
    section_reglementation: 'Réglementation',
    section_exigences: 'Exigences',
    section_gestion_linge: 'Gestion du linge',
    section_equipements: 'Équipements',
    section_consommables: 'Consommables',
    section_visite: 'Visite du logement',
    section_chambres: 'Chambres',
    section_salle_de_bains: 'Salle de bains',
    section_cuisine_1: 'Cuisine - Électroménager',
    section_cuisine_2: 'Cuisine - Ustensiles',
    section_salon_sam: 'Salon',
    section_equip_exterieur: 'Équipements extérieurs',
    section_communs: 'Parties communes',
    section_teletravail: 'Télétravail',
    section_bebe: 'Équipements bébé',
    section_guide_acces: 'Guide d\'accès',
    section_securite: 'Sécurité'
  }
  
  return mapping[sectionKey] || formatGenericKey(sectionKey.replace('section_', ''))
}
const humanizeKey = (key) => {
  const mapping = {
    // Champs spéciaux avec logique contextuelle
    photos_rappels: 'Photos prises',
    atouts_logement: 'Atouts du logement',
    quartier_types: 'Types de quartier',
    types_voyageurs: 'Voyageurs ciblés',
    
    // Documents
    assurance_pno: 'Assurance PNO',
    acte_propriete: 'Acte de propriété',
    carte_identite: 'Carte d\'identité',
    
    // État et propreté
    immeuble_proprete: 'Propreté immeuble',
    logement_proprete: 'Propreté logement',
    immeuble_etat_general: 'État général immeuble',
    logement_etat_general: 'État général logement',
    logement_etat_details: 'Détails état logement',
    
    // Quartier et environnement
    quartier_securite: 'Sécurité quartier',
    quartier_perturbations: 'Perturbations quartier',
    immeuble_accessibilite: 'Accessibilité immeuble',
    immeuble_niveau_sonore: 'Niveau sonore immeuble',
    
    // Logement
    logement_ambiance: 'Ambiance logement',
    logement_vis_a_vis: 'Vis-à-vis logement',
    
    // Photos rappels individuelles
    vis_a_vis_taken: 'vis-à-vis',
    video_globale_taken: 'vidéo globale',
    clefs_taken: 'clefs',
    
    // Équipements courants
    wifi_statut: 'WiFi',
    parking_type: 'Type de parking',
    piscine: 'Piscine',
    jacuzzi: 'Jacuzzi',
    
    // Propriétaire
    nom_proprietaire: 'Nom du propriétaire',
    email: 'Email',
    telephone: 'Téléphone',
    
    // Logement de base
    nom_logement: 'Nom du logement',
    type_propriete: 'Type de propriété',
    nb_chambres: 'Nombre de chambres',
    nb_lits: 'Nombre de lits',
    superficie: 'Superficie',
    
    // Autres champs courants
    types_voyageurs_autre: 'Autres voyageurs',
    explication_adaptation: 'Explication adaptation',
    autres_caracteristiques: 'Autres caractéristiques'
  }
  
  return mapping[key] || formatGenericKey(key)
}

/**
 * Formate une clé générique en transformant snake_case en libellé lisible
 */
const formatGenericKey = (key) => {
    if (!key) return ''
  
    let cleaned = key
      .replace(/_/g, ' ')                 // snake_case -> espaces
      .replace(/([a-z])([A-Z])/g, '$1 $2') // casse collée -> séparée
      .toLowerCase()
      .trim()
  
    // corrections ciblées (accents, termes connus)
    const replacements = {
      'a four': 'à four',
      'poeles': 'poêles',
      'testees': 'testées',
      'elements abimes': 'éléments abîmés',
      'linge': 'linge',
      'salle manger': 'salle à manger',
      'vis a vis': 'vis-à-vis',
      'wifi': 'WiFi',
      'pno': 'PNO',
      'airbnb': 'Airbnb',
      'booking': 'Booking'
    }
  
    Object.entries(replacements).forEach(([wrong, right]) => {
      cleaned = cleaned.replace(new RegExp(`\\b${wrong}\\b`, 'gi'), right)
    })
  
    // Mettre juste la première lettre en majuscule (phrase case)
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  }
  

/**
 * Nettoie les clés _taken pour les photos (photos_equipements_bebe_taken -> équipements bébé)
 */
const cleanPhotoKey = (key) => {
  if (!key.endsWith('_taken')) return key
  
  // Supprimer photos_ et _taken
  let cleaned = key.replace(/^photos?_/, '').replace(/_taken$/, '')
  
  // Mapping spécifique pour les photos
  const photoMapping = {
    equipements_bebe: 'équipements bébé',
    salon_sam: 'salon/salle à manger',
    salle_manger_elements_abimes: 'éléments abîmés salle à manger',
    vis_a_vis: 'vis-à-vis',
    video_globale: 'vidéo globale',
    clefs: 'clés',
    linge: 'linge',
    emplacement: 'emplacement'
  }
  
  return photoMapping[cleaned] || formatGenericKey(cleaned)
}

/**
 * Formate les valeurs enum (quartier_central -> Quartier central)
 */
const formatEnumValue = (value) => {
    if (typeof value !== 'string') return value
  
    let cleaned = value
      .replace(/_/g, ' ')
      .toLowerCase()
      .trim()
  
    // corrections pour accents et termes fréquents
    const replacements = {
      'defavorise': 'défavorisé',
      'tres': 'très',
      'epure': 'épuré',
      'degagee': 'dégagée',
      'bon etat': 'bon état',
      'excellent etat': 'excellent état',
      'mauvais etat': 'mauvais état',
      'zone risques': 'zone à risques',
      'payant': 'payant',
      'gratuit': 'gratuit',
      'calme': 'calme',
      'accessible': 'accessible'
    }
  
    Object.entries(replacements).forEach(([wrong, right]) => {
      cleaned = cleaned.replace(new RegExp(`\\b${wrong}\\b`, 'gi'), right)
    })
  
    // Première lettre majuscule
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  }

/**
 * Formate les valeurs pour affichage humain (version améliorée)
 */
const formatFieldValue = (value, fieldKey = '') => {
  if (typeof value === 'boolean') {
    return value ? 'Oui' : 'Non'
  }

  if (typeof value === 'string') {
    // Nettoyage des valeurs forcées
    const cleaned = value.trim()
    if (cleaned.toUpperCase() === 'OUI' || cleaned === 'Oui') return 'Oui'
    if (cleaned.toUpperCase().startsWith('NON')) return 'Non'
    
    // Formatage des enums
    if (cleaned.includes('_') && !cleaned.includes(' ')) {
      return formatEnumValue(cleaned)
    }
    
    return value
  }

  if (Array.isArray(value)) {
    // Formatage des arrays avec enums
    return value.map(item => 
      typeof item === 'string' && item.includes('_') ? formatEnumValue(item) : item
    ).join(', ')
  }

  if (typeof value === 'object' && value !== null) {
    // Cas spécial pour inventaires (liste d'articles)
    if (fieldKey.includes('inventaire_')) {
      return formatInventory(value)
    }
    
    // Cas spécial pour photos_rappels : format plus lisible
    if (fieldKey === 'photos_rappels') {
      const actives = Object.entries(value)
        .filter(([k, v]) => v === true || v === 'Oui' || v === 'oui')
        .map(([k]) => cleanPhotoKey(k))
        
      return actives.length > 0 ? actives.join(', ') : 'Aucune'
    }
    
    // Cas des checklists classiques (documents, équipements, etc.)
    const actives = Object.entries(value)
      .filter(([k, v]) => v === true || v === 'Oui' || v === 'oui')
      .map(([k]) => formatEnumValue(humanizeKey(k)))
      
    return actives.length > 0 ? actives.join(', ') : 'Aucun'
  }

  return value
}

/**
 * Formate les inventaires sous forme de liste lisible
 */
const formatInventory = (inventory) => {
  if (!inventory || typeof inventory !== 'object') return 'Aucun'
  
  const items = Object.entries(inventory)
    .filter(([key, value]) => value && value !== '0' && value !== 0)
    .map(([key, value]) => `${humanizeKey(key)} : ${value}`)
  
  return items.length > 0 ? '\n• ' + items.join('\n• ') : 'Aucun'
}