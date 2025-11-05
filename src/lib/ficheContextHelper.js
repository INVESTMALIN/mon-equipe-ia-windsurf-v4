// Fonction pour extraire les données pertinentes d'une fiche pour le Guide d'Accès
export function extractFicheContext(fiche) {
    if (!fiche) return null
  
    const context = {}
  
    // Section Propriétaire - Adresse
    if (fiche.section_proprietaire?.adresse) {
      context.adresse = fiche.section_proprietaire.adresse
    }
  
    // Section Clefs
    if (fiche.section_clefs) {
      const clefs = {}
      
      if (fiche.section_clefs.emplacementBoite) {
        clefs.emplacement_boite = fiche.section_clefs.emplacementBoite
      }
      
      if (fiche.section_clefs.interphone !== undefined && fiche.section_clefs.interphone !== null) {
        clefs.interphone = fiche.section_clefs.interphone
      }

      if (fiche.section_clefs.interphoneDetails) {
        clefs.interphone_instructions = fiche.section_clefs.interphoneDetails
      }
      
      if (fiche.section_clefs.tempoGache !== undefined && fiche.section_clefs.tempoGache !== null) {
        clefs.tempo_gache = fiche.section_clefs.tempoGache
      }

      if (fiche.section_clefs.tempoGacheDetails) {
        clefs.tempo_gache_instructions = fiche.section_clefs.tempoGacheDetails
      }
      
      if (fiche.section_clefs.digicode !== undefined && fiche.section_clefs.digicode !== null) {
        clefs.digicode = fiche.section_clefs.digicode
      }

      if (fiche.section_clefs.digicodeDetails) {
        clefs.digicode_instructions = fiche.section_clefs.digicodeDetails
      }
      
      if (fiche.section_clefs.clefs?.precision) {
        clefs.precisions = fiche.section_clefs.clefs.precision
      }
      
      if (Object.keys(clefs).length > 0) {
        context.clefs = clefs
      }
    }
  
    // Section Equipements - Parking et WiFi
    if (fiche.section_equipements) {
      const equipements = {}
      
      if (fiche.section_equipements.parking_type) {
        equipements.parking_type = fiche.section_equipements.parking_type
        
        // Ajouter les détails selon le type de parking
        if (fiche.section_equipements.parking_type === 'rue' && fiche.section_equipements.parking_rue_details) {
          equipements.parking_details = fiche.section_equipements.parking_rue_details
        }
        if (fiche.section_equipements.parking_type === 'sur_place' && fiche.section_equipements.parking_sur_place_details) {
          equipements.parking_details = fiche.section_equipements.parking_sur_place_details
        }
        if (fiche.section_equipements.parking_type === 'payant' && fiche.section_equipements.parking_payant_details) {
          equipements.parking_details = fiche.section_equipements.parking_payant_details
        }
      }
      
      // WiFi
      if (fiche.section_equipements.wifi_statut) {
        equipements.wifi_statut = fiche.section_equipements.wifi_statut
      }

      if (fiche.section_equipements.wifi_nom_reseau) {
        equipements.wifi_nom_reseau = fiche.section_equipements.wifi_nom_reseau
      }

      if (fiche.section_equipements.wifi_mot_de_passe) {
        equipements.wifi_mot_de_passe = fiche.section_equipements.wifi_mot_de_passe
      }
      
      if (fiche.section_equipements.wifi_details) {
        equipements.wifi_details = fiche.section_equipements.wifi_details
      }
      
      if (Object.keys(equipements).length > 0) {
        context.equipements = equipements
      }
    }
  
    // Section Guide d'Accès
    if (fiche.section_guide_acces) {
      const guide = {}
      
      if (fiche.section_guide_acces.point_repere_principal) {
        guide.point_repere = fiche.section_guide_acces.point_repere_principal
      }
      
      if (fiche.section_guide_acces.description_acces) {
        guide.description = fiche.section_guide_acces.description_acces
      }
      
      if (fiche.section_guide_acces.conseils_voyageurs) {
        guide.conseils = fiche.section_guide_acces.conseils_voyageurs
      }
      
      if (Object.keys(guide).length > 0) {
        context.guide_acces = guide
      }
    }
  
    // Section Logement - Étage et numéro de porte
    if (fiche.section_logement) {
      const logement = {}
      
      if (fiche.section_logement.appartement?.etage) {
        logement.etage = fiche.section_logement.appartement.etage
      }
      
      if (fiche.section_logement.appartement?.numero_porte) {
        logement.numero_porte = fiche.section_logement.appartement.numero_porte
      }
      
      if (Object.keys(logement).length > 0) {
        context.logement = logement
      }
    }
  
    // Ne retourner que si au moins une donnée existe
    return Object.keys(context).length > 0 ? context : null
  }