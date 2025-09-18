// src/lib/AlerteDetector.js
// Système de détection des alertes basé sur le mapping Mon Équipe IA

/**
 * Détecte toutes les alertes dans les données de fiche
 * Utilise le mapping Mon Équipe IA (pas Letahost)
 */
export const detectAlertes = (formData) => {
    const alertes = {
      critiques: [],
      moderees: [],
      elementsAbimes: []
    }
  
    // 🔴 ALERTES CRITIQUES (5 champs)
    
    // 1. Zone à risques
    if (formData.section_avis?.quartier_securite === 'zone_risques') {
      alertes.critiques.push({
        type: 'zone_risques',
        titre: 'Zone à risques',
        message: 'Le logement se trouve dans une zone considérée comme à risques',
        icone: '🚨',
        action: 'Refus logement recommandé'
      })
    }
  
    // 2 & 3. État du logement
    const etatLogement = formData.section_avis?.logement_etat_general
    if (etatLogement === 'etat_degrade') {
      alertes.critiques.push({
        type: 'etat_degrade',
        titre: 'État dégradé',
        message: 'Le logement nécessite des travaux avant mise en location',
        icone: '🏠',
        action: 'Pause travaux nécessaire'
      })
    }
    if (etatLogement === 'tres_mauvais_etat') {
      alertes.critiques.push({
        type: 'tres_mauvais_etat',
        titre: 'Très mauvais état',
        message: 'Le logement est en très mauvais état général',
        icone: '💥',
        action: 'Refus logement recommandé'
      })
    }
  
    // 4. Propreté
    if (formData.section_avis?.logement_proprete === 'sale') {
      alertes.critiques.push({
        type: 'proprete_sale',
        titre: 'Logement sale',
        message: 'Le logement nécessite un nettoyage complet',
        icone: '🧽',
        action: 'Remise en état nécessaire'
      })
    }
  
    // 5. WiFi manquant
    if (formData.section_equipements?.wifi_statut === 'non') {
      alertes.critiques.push({
        type: 'wifi_manquant',
        titre: 'Pas de WiFi',
        message: 'Le WiFi n\'est pas disponible dans le logement',
        icone: '📶',
        action: 'Installation WiFi recommandée'
      })
    }
  
    // 🟡 ALERTES MODÉRÉES (7 champs)
  
    // 6. Validation vidéo (si champ existe)
    if (formData.section_avis?.video_validation === false) {
      alertes.moderees.push({
        type: 'video_validation',
        titre: 'Vidéo non validée',
        message: 'La vidéo de présentation n\'a pas été validée',
        icone: '🎥'
      })
    }
  
    // 7. Quartier défavorisé
    if (formData.section_avis?.quartier_types?.includes('quartier_defavorise')) {
      alertes.moderees.push({
        type: 'quartier_defavorise',
        titre: 'Quartier défavorisé',
        message: 'Le logement se situe dans un quartier défavorisé',
        icone: '🏘️'
      })
    }
  
    // 8. Immeuble mauvais état
    if (formData.section_avis?.immeuble_etat_general === 'mauvais_etat') {
      alertes.moderees.push({
        type: 'immeuble_mauvais_etat',
        titre: 'Immeuble en mauvais état',
        message: 'L\'immeuble nécessite des améliorations',
        icone: '🏢'
      })
    }
  
    // 9. Immeuble sale
    if (formData.section_avis?.immeuble_proprete === 'sale') {
      alertes.moderees.push({
        type: 'immeuble_sale',
        titre: 'Immeuble sale',
        message: 'L\'immeuble manque de propreté',
        icone: '🧹'
      })
    }
  
    // 10. Absence décoration
    if (formData.section_avis?.logement_ambiance?.includes('absence_decoration')) {
      alertes.moderees.push({
        type: 'absence_decoration',
        titre: 'Manque de décoration',
        message: 'Le logement manque d\'éléments décoratifs',
        icone: '🎨'
      })
    }
  
    // 11. Décoration personnalisée
    if (formData.section_avis?.logement_ambiance?.includes('decoration_personnalisee')) {
      alertes.moderees.push({
        type: 'decoration_personnalisee',
        titre: 'Décoration trop personnalisée',
        message: 'La décoration peut ne pas plaire à tous les voyageurs',
        icone: '🖼️'
      })
    }
  
    // 12. Vis-à-vis direct
    if (formData.section_avis?.logement_vis_a_vis === 'vis_a_vis_direct') {
      alertes.moderees.push({
        type: 'vis_a_vis_direct',
        titre: 'Vis-à-vis direct',
        message: 'Le logement a un vis-à-vis direct avec d\'autres bâtiments',
        icone: '👀'
      })
    }
  
    // ⚠️ ÉLÉMENTS ABÎMÉS - Détection automatique
    const champsAbimes = [
      // Cuisine
      { section: 'section_cuisine_1', champ: 'elements_abimes', nom: 'Cuisine' },
      
      // Salon/SAM
      { section: 'section_salon_sam', champ: 'salon_elements_abimes', nom: 'Salon' },
      { section: 'section_salon_sam', champ: 'salle_manger_elements_abimes', nom: 'Salle à manger' },
      
      // Chambres (6 chambres)
      { section: 'section_chambres', champ: 'chambre_1.elements_abimes', nom: 'Chambre 1' },
      { section: 'section_chambres', champ: 'chambre_2.elements_abimes', nom: 'Chambre 2' },
      { section: 'section_chambres', champ: 'chambre_3.elements_abimes', nom: 'Chambre 3' },
      { section: 'section_chambres', champ: 'chambre_4.elements_abimes', nom: 'Chambre 4' },
      { section: 'section_chambres', champ: 'chambre_5.elements_abimes', nom: 'Chambre 5' },
      { section: 'section_chambres', champ: 'chambre_6.elements_abimes', nom: 'Chambre 6' },
      
      // Salles de bains (6 SDB)
      { section: 'section_salle_de_bains', champ: 'salle_de_bain_1.elements_abimes', nom: 'Salle de bain 1' },
      { section: 'section_salle_de_bains', champ: 'salle_de_bain_2.elements_abimes', nom: 'Salle de bain 2' },
      { section: 'section_salle_de_bains', champ: 'salle_de_bain_3.elements_abimes', nom: 'Salle de bain 3' },
      { section: 'section_salle_de_bains', champ: 'salle_de_bain_4.elements_abimes', nom: 'Salle de bain 4' },
      { section: 'section_salle_de_bains', champ: 'salle_de_bain_5.elements_abimes', nom: 'Salle de bain 5' },
      { section: 'section_salle_de_bains', champ: 'salle_de_bain_6.elements_abimes', nom: 'Salle de bain 6' },
      
      // Équipements extérieurs
      { section: 'section_equip_spe_exterieur', champ: 'garage_elements_abimes', nom: 'Garage' },
      { section: 'section_equip_spe_exterieur', champ: 'buanderie_elements_abimes', nom: 'Buanderie' },
      { section: 'section_equip_spe_exterieur', champ: 'autres_pieces_elements_abimes', nom: 'Autres pièces' }
    ]
  
    // Vérification des éléments abîmés
    champsAbimes.forEach(({ section, champ, nom }) => {
      const sectionData = formData[section]
      if (sectionData) {
        // Gestion des champs imbriqués (chambre_1.elements_abimes)
        const champPath = champ.split('.')
        let value = sectionData
        
        for (const part of champPath) {
          value = value?.[part]
        }
        
        if (value === true) {
          alertes.elementsAbimes.push({
            type: 'elements_abimes',
            titre: `${nom} - Éléments abîmés`,
            message: `Des éléments sont abîmés dans ${nom.toLowerCase()}`,
            icone: '',
            espace: nom
          })
        }
      }
    })
  
    return alertes
  }
  
  /**
   * Génère l'aperçu des caractéristiques principales
   */
  export const generateApercu = (formData) => {
    const logement = formData.section_logement || {}
    const avis = formData.section_avis || {}
    const equipements = formData.section_equipements || {}
    const proprietaire = formData.section_proprietaire || {}
  
    // Atouts sélectionnés
    const atouts = Object.entries(avis.atouts_logement || {})
      .filter(([_, isSelected]) => isSelected)
      .map(([atout, _]) => formatAtoutName(atout))
      .slice(0, 5) // Top 5
  
    return {
      // Informations principales
      nom: logement.type_propriete || 'Non renseigné',
      proprietaire: `${proprietaire.prenom || ''} ${proprietaire.nom || ''}`.trim() || 'Non renseigné',
      
      // Capacité et caractéristiques
      capacite: {
        personnes: logement.nombre_personnes_max || 'Non renseigné',
        chambres: logement.nombre_chambres || 'Non renseigné',
        lits: logement.nombre_lits || 'Non renseigné',
        surface: logement.surface ? `${logement.surface} m²` : 'Non renseigné'
      },
  
      // Équipements clés
      equipements: {
        wifi: {
          disponible: equipements.wifi_statut === 'oui',
          statut: equipements.wifi_statut || 'non_renseigne',
          texte: equipements.wifi_statut === 'oui' ? '✅ WiFi disponible' : 
                 equipements.wifi_statut === 'en_cours' ? '🔄 Installation en cours' :
                 equipements.wifi_statut === 'non' ? '❌ Pas de WiFi' : '❓ Non renseigné'
        },
        parking: {
          type: equipements.parking_type || 'non_renseigne',
          texte: equipements.parking_type === 'rue' ? '🚗 Parking dans la rue' :
                 equipements.parking_type === 'sur_place' ? '🅿️ Parking sur place' :
                 equipements.parking_type === 'payant' ? '💳 Parking payant' : '❓ Non renseigné'
        }
      },
  
      // Évaluation globale
      evaluation: {
        quartier_securite: avis.quartier_securite || 'non_renseigne',
        logement_etat: avis.logement_etat_general || 'non_renseigne',
        logement_proprete: avis.logement_proprete || 'non_renseigne'
      },
  
      // Atouts
      atouts: atouts,
      
      // Statut
      statut: formData.statut || 'Brouillon'
    }
  }
  
  /**
   * Formate les noms d'atouts pour affichage
   */
  const formatAtoutName = (atout) => {
    const mapping = {
      'lumineux': 'Lumineux',
      'rustique': 'Rustique', 
      'central': 'Central',
      'convivial': 'Convivial',
      'authentique': 'Authentique',
      'douillet': 'Douillet',
      'design_moderne': 'Design moderne',
      'terrasse_balcon': 'Terrasse/Balcon',
      'proche_transports': 'Proche transports',
      'piscine': 'Piscine',
      'jacuzzi': 'Jacuzzi',
      'cheminee': 'Cheminée',
      'charmant': 'Charmant',
      'elegant': 'Élégant',
      'atypique': 'Atypique',
      'renove': 'Rénové',
      'familial': 'Familial',
      'cosy_confortable': 'Cosy/Confortable',
      'decoration_traditionnelle': 'Décoration traditionnelle',
      'jardin': 'Jardin',
      'proche_commerces': 'Proche commerces',
      'sauna_spa': 'Sauna/Spa',
      'video_projecteur': 'Vidéo projecteur',
      'station_recharge_electrique': 'Station de recharge',
      'romantique': 'Romantique',
      'paisible': 'Paisible',
      'chic': 'Chic',
      'accueillant': 'Accueillant',
      'tranquille': 'Tranquille',
      'spacieux': 'Spacieux',
      'vue_panoramique': 'Vue panoramique',
      'parking_prive': 'Parking privé',
      'equipements_haut_gamme': 'Équipements haut de gamme',
      'billard': 'Billard',
      'jeux_arcade': 'Jeux d\'arcade',
      'table_ping_pong': 'Table de ping-pong'
    }
    
    return mapping[atout] || atout.replace(/_/g, ' ')
  }
  
