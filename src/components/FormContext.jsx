import { supabase } from '../supabaseClient'
import { saveFiche, loadFiche } from '../lib/supabaseHelpers'
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

const FormContext = createContext()

// 🔥 SECTIONS DE FICHE LOGEMENT LITE (23 sections)
const sections = [
  "Propriétaire",
  "Logement",
  "Avis",
  "Clefs",
  "Airbnb",
  "Booking",
  "Réglementation",
  "Exigences",
  "Gestion Linge",
  "Équipements",
  "Consommables",
  "Visite",
  "Chambres",
  "Salle de Bains",
  "Cuisine 1",
  "Cuisine 2",
  "Salon SAM",
  "Équip. Extérieur",
  "Communs",
  "Télétravail",
  "Bébé",
  "Guide Accès",
  "Sécurité",
  "✨ Finalisation"
]

const initialFormData = {
  id: null,
  user_id: null,
  created_at: null,
  updated_at: null,
  nom: "Nouvelle fiche",
  statut: "Brouillon",

  section_proprietaire: {
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    adresse: {
      rue: "",
      complement: "",
      ville: "",
      codePostal: ""
    }
  },

  section_logement: {
    type_propriete: "",
    type_autre_precision: "",
    surface: "",
    typologie: "",
    nombre_personnes_max: "",
    nombre_lits: "",
    classement_logement: "",
    // Maison / Villa
    maison_niveau: "", // "plain_pied" | "etage"
    maison_nb_etages: "",
    // Appartement
    appartement: {
      nom_residence: "",
      batiment: "",
      acces: "",
      etage: "",
      numero_porte: ""
    },
    // Studio
    studio: {
      nom_residence: "",
      batiment: "",
      acces: "",
      etage: "",
      numero_porte: ""
    }
  },

  section_avis: {
    // Évaluation quartier
    quartier_types: [],
    quartier_securite: "",
    quartier_perturbations: "",
    quartier_perturbations_details: "",

    // Évaluation immeuble
    immeuble_etat_general: "",
    immeuble_proprete: "",
    immeuble_accessibilite: "",
    immeuble_niveau_sonore: "",

    // Évaluation logement - grille objective (9 critères x note + observations)
    grille_proprete_generale_note: null,
    grille_proprete_generale_obs: "",
    grille_sols_note: null,
    grille_sols_obs: "",
    grille_murs_plafonds_note: null,
    grille_murs_plafonds_obs: "",
    grille_cuisine_note: null,
    grille_cuisine_obs: "",
    grille_salle_bain_note: null,
    grille_salle_bain_obs: "",
    grille_equipements_note: null,
    grille_equipements_obs: "",
    grille_menuiseries_note: null,
    grille_menuiseries_obs: "",
    grille_odeurs_note: null,
    grille_odeurs_obs: "",
    grille_impression_generale_note: null,
    grille_impression_generale_obs: "",

    // Vérification sécurité
    securite_dangers: [],

    // Type de 1er passage
    type_premier_menage: null,
    type_premiere_maintenance: null,

    // Évaluation logement - ambiance et vis-à-vis
    logement_ambiance: [],
    logement_absence_decoration_details: "",
    logement_decoration_personnalisee_details: "",
    logement_vis_a_vis: "",

    // Atouts du logement
    atouts_logement: {
      lumineux: false,
      rustique: false,
      central: false,
      convivial: false,
      authentique: false,
      douillet: false,
      design_moderne: false,
      terrasse_balcon: false,
      proche_transports: false,
      piscine: false,
      jacuzzi: false,
      cheminee: false,
      charmant: false,
      elegant: false,
      atypique: false,
      renove: false,
      familial: false,
      cosy_confortable: false,
      decoration_traditionnelle: false,
      jardin: false,
      proche_commerces: false,
      sauna_spa: false,
      video_projecteur: false,
      station_recharge_electrique: false,
      romantique: false,
      paisible: false,
      chic: false,
      accueillant: false,
      tranquille: false,
      spacieux: false,
      vue_panoramique: false,
      parking_prive: false,
      equipements_haut_gamme: false,
      billard: false,
      jeux_arcade: false,
      table_ping_pong: false,
      autres_atouts: false
    },
    atouts_logement_autre: "",
    autres_caracteristiques: "",

    // 👁️ Vue depuis le logement (multi-sélection, clés stables — cf. optionsVue dans FicheAvis)
    // Array de clés type ["vue_mer", "vue_montagne"]. "vue_aucune" = évalué, rien à valoriser.
    vue_types: [],

    // Types de voyageurs
    types_voyageurs: {
      duo_amoureux: false,
      nomades_numeriques: false,
      aventuriers_independants: false,
      tribus_familiales: false,
      bandes_amis: false,
      voyageurs_experience: false,
      autres_voyageurs: false
    },
    types_voyageurs_autre: "",
    explication_adaptation: "",

    // Rappels photos (VERSION LITE)
    photos_rappels: {
      video_globale_taken: false,
      vis_a_vis_taken: false,
      etat_logement_video_taken: false
    }
  },

  section_clefs: {
    // Type de boîte à clés
    boiteType: "", // "TTlock", "Igloohome", "Masterlock"
    boiteType_autre_precision: "",
    emplacementBoite: "",

    // Configurations spécifiques par type
    ttlock: {
      masterpinConciergerie: "",
      codeProprietaire: "",
      codeMenage: ""
    },
    igloohome: {
      masterpinConciergerie: "",
      codeVoyageur: "",
      codeProprietaire: "",
      codeMenage: ""
    },
    masterlock: {
      code: ""
    },

    // Interphone
    interphone: null, // true/false/null
    interphoneDetails: "",

    // Tempo-gâche
    tempoGache: null, // true/false/null
    tempoGacheDetails: "",

    // Digicode
    digicode: null, // true/false/null
    digicodeDetails: "",

    // Clefs physiques
    clefs: {
      precision: "",
      prestataire: null, // true/false/null
      details: ""
    },

    // Rappels photos (VERSION LITE)
    photos_rappels: {
      emplacement_taken: false,
      interphone_taken: false,
      tempo_gache_taken: false,
      digicode_taken: false,
      clefs_taken: false
    }
  },

  section_airbnb: {
    annonce_active: null, // true/false/null
    url_annonce: "",
    identifiants_obtenus: null, // true/false/null
    email_compte: "",
    mot_passe: "",
    explication_refus: ""
  },

  section_booking: {
    annonce_active: null, // true/false/null
    url_annonce: "",
    identifiants_obtenus: null, // true/false/null
    email_compte: "",
    mot_passe: "",
    explication_refus: ""
  },

  section_reglementation: {
    // Villes et réglementation
    ville_changement_usage: "",
    ville_declaration_simple: "",
    date_expiration_changement: "",
    numero_declaration: "",
    details_reglementation: "",

    // 🔋 DPE : "" = non renseigné, "A".."G", "Non communiqué" = réponse explicite
    classe_dpe: "",
    // Estimation dépenses énergétiques annuelles (€/an), fourchette — uniquement F/G
    dpe_depenses_min: "",
    dpe_depenses_max: "",

    // Documents checklist
    documents: {
      carte_identite: false,
      rib: false,
      cerfa: false,
      assurance_pno: false,
      rcp: false,
      acte_propriete: false
    }
  },

  section_exigences: {
    nombre_nuits_minimum: "",
    tarif_minimum_nuit: "",
    dates_bloquees: "",
    precisions_exigences: ""
  },

  section_gestion_linge: {
    dispose_de_linge: null, // true/false/null

    // Inventaires par taille de lit
    inventaire_90x200: {
      couettes: "",
      oreillers: "",
      draps_housses: "",
      housses_couette: "",
      protections_matelas: "",
      taies_oreillers: ""
    },
    inventaire_140x200: {
      couettes: "",
      oreillers: "",
      draps_housses: "",
      housses_couette: "",
      protections_matelas: "",
      taies_oreillers: ""
    },
    inventaire_160x200: {
      couettes: "",
      oreillers: "",
      draps_housses: "",
      housses_couette: "",
      protections_matelas: "",
      taies_oreillers: ""
    },
    inventaire_180x200: {
      couettes: "",
      oreillers: "",
      draps_housses: "",
      housses_couette: "",
      protections_matelas: "",
      taies_oreillers: ""
    },
    inventaire_autres: {
      draps_bain: "",
      petites_serviettes: "",
      tapis_bain: "",
      torchons: "",
      plaids: "",
      oreillers_decoratifs: ""
    },

    // État du linge
    etat_neuf: false,
    etat_usage: false,
    etat_propre: false,
    etat_sale: false,
    etat_tache: false,
    etat_informations: "",

    // Emplacement du stock
    emplacement_description: "",
    emplacement_code_cadenas: "",

    // Rappels photos
    photos_rappels: {
      linge_taken: false,
      emplacement_taken: false
    }
  },


  section_equipements: {
    // Équipements techniques essentiels
    poubelle_emplacement: "",
    poubelle_ramassage: "",
    disjoncteur_emplacement: "",
    vanne_eau_emplacement: "",
    systeme_chauffage_eau: "", // "Chaudière" ou "Ballon d'eau chaude"
    chauffage_eau_emplacement: "",

    // Équipements et commodités (checklist)
    climatisation: false,
    lave_linge: false,
    seche_linge: false,
    parking_equipement: false,
    tourne_disque: false,
    coffre_fort: false,
    ascenseur: false,
    animaux_acceptes: false,
    fetes_autorisees: false,
    tv: false,
    chauffage: false,
    fer_repasser: false,
    etendoir: false,
    piano: false,
    cinema: false,
    compacteur_dechets: false,
    accessible_mobilite_reduite: false,
    fumeurs_acceptes: false,

    // Configuration Wi-Fi
    wifi_statut: "", // "oui", "en_cours", "non"
    wifi_details: "",

    // Parking
    parking_type: "", // "rue", "sur_place", "payant"
    parking_rue_details: "",
    parking_sur_place_types: [], // array de types multiples
    parking_sur_place_details: "",
    parking_payant_type: "", // radio unique
    parking_payant_details: "",

    // === NOUVEAUX CHAMPS CONDITIONNELS ===

    // TV (conditionnel si tv = true)
    tv_type: "", // "Écran plat", "Téléviseur", "Projecteur", "Autre"
    tv_type_autre_details: "", // Si tv_type = "Autre"
    tv_taille: "", // Texte libre
    tv_services: [], // Array: "Netflix", "Amazon Prime", etc.
    tv_consoles: [], // Array: "PlayStation", "Xbox", etc.

    // Climatisation (conditionnel si climatisation = true)
    climatisation_type: "", // "Centralisée", "Individuelle par pièce", "Portable"
    climatisation_instructions: "", // Textarea

    // Chauffage (conditionnel si chauffage = true)
    chauffage_type: "", // "Central", "Électrique", "Gaz", "Poêle", "Cheminée"
    chauffage_instructions: "", // Textarea

    // Lave-linge (conditionnel si lave_linge = true)
    lave_linge_prix: "", // "Compris", "Supplément"
    lave_linge_emplacement: "",
    lave_linge_instructions: "",

    // Sèche-linge (conditionnel si seche_linge = true)
    seche_linge_prix: "", // "Compris", "Supplément"
    seche_linge_emplacement: "",
    seche_linge_instructions: "",

    // Piano (conditionnel si piano = true)
    piano_marque: "",
    piano_type: "", // "À queue", "Droit", "Numérique"

    // PMR (conditionnel si accessible_mobilite_reduite = true)
    pmr_details: "", // Textarea

    // Animaux (conditionnel si animaux_acceptes = true)
    animaux_commentaire: "", // Textarea

    // WiFi - NOUVEAUX identifiants (conditionnel si wifi_statut = "oui")
    wifi_nom_reseau: "", // SSID
    wifi_mot_de_passe: "", // Password

    // === PHOTOS RAPPELS (VERSION LITE) ===
    photos_rappels: {
      // Existants
      video_acces_poubelle_taken: false,
      poubelle_taken: false,
      disjoncteur_taken: false,
      vanne_arret_taken: false,
      chauffage_eau_taken: false,
      video_systeme_chauffage_taken: false,

      // Nouveaux rappels pour équipements conditionnels
      tv_video_taken: false,
      tv_consoles_video_taken: false,
      climatisation_video_taken: false,
      chauffage_video_taken: false,
      lave_linge_video_taken: false,
      seche_linge_video_taken: false,
      parking_photos_taken: false,
      parking_video_taken: false,
      wifi_routeur_photo_taken: false
    }
  },


  section_consommables: {
    fournis_par_prestataire: null, // true/false/null

    // Consommables recommandés (ex-obligatoires)
    papier_toilette: false,
    savon_mains: false,
    produit_vaisselle: false,
    eponge_cuisine: false,
    sel_poivre_sucre: false,
    cafe_the: false,
    essuie_tout: false,
    sac_poubelle: false,
    produit_vitres: false,
    produit_sol: false,
    produit_salle_bain: false,
    produit_wc_javel: false,
    consommables_recommandes_autre: false,
    consommables_recommandes_autre_details: "",

    // Consommables "Sur demande"
    gel_douche: false,
    shampoing: false,
    apres_shampoing: false,
    pastilles_lave_vaisselle: false,
    autre_consommable: false,
    autre_consommable_details: "",

    // Types de café
    cafe_nespresso: false,
    cafe_senseo: false,
    cafe_tassimo: false,
    cafe_soluble: false,
    cafe_moulu: false,
    cafe_grain: false,
    cafe_autre: false,
    cafe_autre_details: ""
  },

  section_visite: {
    // Types de pièces (checkboxes)
    pieces_chambre: false,
    pieces_salon: false,
    pieces_salle_bains: false,
    pieces_salon_prive: false,
    pieces_kitchenette: false,
    pieces_cuisine: false,
    pieces_salle_manger: false,
    pieces_bureau: false,
    pieces_salle_jeux: false,
    pieces_salle_sport: false,
    pieces_buanderie: false,
    pieces_terrasse: false,
    pieces_balcon: false,
    pieces_jardin: false,
    pieces_autre: false,
    pieces_autre_details: "",

    // Nombres conditionnels
    nombre_chambres: "", // si pieces_chambre = true
    nombre_salles_bains: "", // si pieces_salle_bains = true

    // Photos rappels (VERSION LITE)
    photos_rappels: {
      video_visite_taken: false
    }
  },

  section_chambres: {

    chambre_1: {
      nom_description: "",
      lit_simple_90_190: 0,
      lit_double_140_190: 0,
      lit_queen_160_200: 0,
      lit_king_180_200: 0,
      canape_lit_simple: 0,
      canape_lit_double: 0,
      lits_superposes_90_190: 0,
      lit_gigogne: 0,
      autre_type_lit: "",
      equipements_draps_fournis: null,
      equipements_climatisation: null,
      equipements_ventilateur_plafond: null,
      equipements_espace_rangement: null,
      equipements_lit_bebe_60_120: null,
      equipements_stores: null,
      equipements_television: null,
      equipements_oreillers_couvertures_sup: null,
      equipements_chauffage: null,
      equipements_cintres: null,
      equipements_moustiquaire: null,
      equipements_lit_parapluie_60_120: null,
      equipements_systeme_audio: null,
      equipements_coffre_fort: null,
      equipements_autre: null,
      equipements_autre_details: "",
      elements_abimes: null,
      photos_rappels: {
        photos_chambre_taken: false,
        elements_abimes_taken: false
      }
    },

    chambre_2: {
      nom_description: "",
      lit_simple_90_190: 0,
      lit_double_140_190: 0,
      lit_queen_160_200: 0,
      lit_king_180_200: 0,
      canape_lit_simple: 0,
      canape_lit_double: 0,
      lits_superposes_90_190: 0,
      lit_gigogne: 0,
      autre_type_lit: "",
      equipements_draps_fournis: null,
      equipements_climatisation: null,
      equipements_ventilateur_plafond: null,
      equipements_espace_rangement: null,
      equipements_lit_bebe_60_120: null,
      equipements_stores: null,
      equipements_television: null,
      equipements_oreillers_couvertures_sup: null,
      equipements_chauffage: null,
      equipements_cintres: null,
      equipements_moustiquaire: null,
      equipements_lit_parapluie_60_120: null,
      equipements_systeme_audio: null,
      equipements_coffre_fort: null,
      equipements_autre: null,
      equipements_autre_details: "",
      elements_abimes: null,
      photos_rappels: {
        photos_chambre_taken: false,
        elements_abimes_taken: false
      }
    },

    chambre_3: {
      nom_description: "",
      lit_simple_90_190: 0,
      lit_double_140_190: 0,
      lit_queen_160_200: 0,
      lit_king_180_200: 0,
      canape_lit_simple: 0,
      canape_lit_double: 0,
      lits_superposes_90_190: 0,
      lit_gigogne: 0,
      autre_type_lit: "",
      equipements_draps_fournis: null,
      equipements_climatisation: null,
      equipements_ventilateur_plafond: null,
      equipements_espace_rangement: null,
      equipements_lit_bebe_60_120: null,
      equipements_stores: null,
      equipements_television: null,
      equipements_oreillers_couvertures_sup: null,
      equipements_chauffage: null,
      equipements_cintres: null,
      equipements_moustiquaire: null,
      equipements_lit_parapluie_60_120: null,
      equipements_systeme_audio: null,
      equipements_coffre_fort: null,
      equipements_autre: null,
      equipements_autre_details: "",
      elements_abimes: null,
      photos_rappels: {
        photos_chambre_taken: false,
        elements_abimes_taken: false
      }
    },

    chambre_4: {
      nom_description: "",
      lit_simple_90_190: 0,
      lit_double_140_190: 0,
      lit_queen_160_200: 0,
      lit_king_180_200: 0,
      canape_lit_simple: 0,
      canape_lit_double: 0,
      lits_superposes_90_190: 0,
      lit_gigogne: 0,
      autre_type_lit: "",
      equipements_draps_fournis: null,
      equipements_climatisation: null,
      equipements_ventilateur_plafond: null,
      equipements_espace_rangement: null,
      equipements_lit_bebe_60_120: null,
      equipements_stores: null,
      equipements_television: null,
      equipements_oreillers_couvertures_sup: null,
      equipements_chauffage: null,
      equipements_cintres: null,
      equipements_moustiquaire: null,
      equipements_lit_parapluie_60_120: null,
      equipements_systeme_audio: null,
      equipements_coffre_fort: null,
      equipements_autre: null,
      equipements_autre_details: "",
      elements_abimes: null,
      photos_rappels: {
        photos_chambre_taken: false,
        elements_abimes_taken: false
      }
    },

    chambre_5: {
      nom_description: "",
      lit_simple_90_190: 0,
      lit_double_140_190: 0,
      lit_queen_160_200: 0,
      lit_king_180_200: 0,
      canape_lit_simple: 0,
      canape_lit_double: 0,
      lits_superposes_90_190: 0,
      lit_gigogne: 0,
      autre_type_lit: "",
      equipements_draps_fournis: null,
      equipements_climatisation: null,
      equipements_ventilateur_plafond: null,
      equipements_espace_rangement: null,
      equipements_lit_bebe_60_120: null,
      equipements_stores: null,
      equipements_television: null,
      equipements_oreillers_couvertures_sup: null,
      equipements_chauffage: null,
      equipements_cintres: null,
      equipements_moustiquaire: null,
      equipements_lit_parapluie_60_120: null,
      equipements_systeme_audio: null,
      equipements_coffre_fort: null,
      equipements_autre: null,
      equipements_autre_details: "",
      elements_abimes: null,
      photos_rappels: {
        photos_chambre_taken: false,
        elements_abimes_taken: false
      }
    },

    chambre_6: {
      nom_description: "",
      lit_simple_90_190: 0,
      lit_double_140_190: 0,
      lit_queen_160_200: 0,
      lit_king_180_200: 0,
      canape_lit_simple: 0,
      canape_lit_double: 0,
      lits_superposes_90_190: 0,
      lit_gigogne: 0,
      autre_type_lit: "",
      equipements_draps_fournis: null,
      equipements_climatisation: null,
      equipements_ventilateur_plafond: null,
      equipements_espace_rangement: null,
      equipements_lit_bebe_60_120: null,
      equipements_stores: null,
      equipements_television: null,
      equipements_oreillers_couvertures_sup: null,
      equipements_chauffage: null,
      equipements_cintres: null,
      equipements_moustiquaire: null,
      equipements_lit_parapluie_60_120: null,
      equipements_systeme_audio: null,
      equipements_coffre_fort: null,
      equipements_autre: null,
      equipements_autre_details: "",
      elements_abimes: null,
      photos_rappels: {
        photos_chambre_taken: false,
        elements_abimes_taken: false
      }
    }
  },

  section_salle_de_bains: {
    salle_de_bain_1: {
      nom_description: "",
      // Équipements
      equipements_douche: null,
      equipements_baignoire: null,
      equipements_douche_baignoire_combinees: null,
      equipements_double_vasque: null,
      equipements_wc: null,
      equipements_bidet: null,
      equipements_chauffage: null,
      equipements_lave_linge: null,
      equipements_seche_serviette: null,
      equipements_seche_cheveux: null,
      equipements_autre: null,
      equipements_autre_details: "",
      // Logique conditionnelle WC séparé
      wc_separe: null, // true/false/null - affiché si equipements_wc = true
      // Accès
      acces: "", // "privee" ou "partagee"
      // Éléments abîmés
      elements_abimes: null, // true/false/null
      // Photos rappels (VERSION LITE)
      photos_rappels: {
        photos_salle_de_bain_taken: false,
        elements_abimes_taken: false
      }
    },

    salle_de_bain_2: {
      nom_description: "",
      equipements_douche: null,
      equipements_baignoire: null,
      equipements_douche_baignoire_combinees: null,
      equipements_double_vasque: null,
      equipements_wc: null,
      equipements_bidet: null,
      equipements_chauffage: null,
      equipements_lave_linge: null,
      equipements_seche_serviette: null,
      equipements_seche_cheveux: null,
      equipements_autre: null,
      equipements_autre_details: "",
      wc_separe: null,
      acces: "",
      elements_abimes: null,
      photos_rappels: {
        photos_salle_de_bain_taken: false,
        elements_abimes_taken: false
      }
    },

    salle_de_bain_3: {
      nom_description: "",
      equipements_douche: null,
      equipements_baignoire: null,
      equipements_douche_baignoire_combinees: null,
      equipements_double_vasque: null,
      equipements_wc: null,
      equipements_bidet: null,
      equipements_chauffage: null,
      equipements_lave_linge: null,
      equipements_seche_serviette: null,
      equipements_seche_cheveux: null,
      equipements_autre: null,
      equipements_autre_details: "",
      wc_separe: null,
      acces: "",
      elements_abimes: null,
      photos_rappels: {
        photos_salle_de_bain_taken: false,
        elements_abimes_taken: false
      }
    },

    salle_de_bain_4: {
      nom_description: "",
      equipements_douche: null,
      equipements_baignoire: null,
      equipements_douche_baignoire_combinees: null,
      equipements_double_vasque: null,
      equipements_wc: null,
      equipements_bidet: null,
      equipements_chauffage: null,
      equipements_lave_linge: null,
      equipements_seche_serviette: null,
      equipements_seche_cheveux: null,
      equipements_autre: null,
      equipements_autre_details: "",
      wc_separe: null,
      acces: "",
      elements_abimes: null,
      photos_rappels: {
        photos_salle_de_bain_taken: false,
        elements_abimes_taken: false
      }
    },

    salle_de_bain_5: {
      nom_description: "",
      equipements_douche: null,
      equipements_baignoire: null,
      equipements_douche_baignoire_combinees: null,
      equipements_double_vasque: null,
      equipements_wc: null,
      equipements_bidet: null,
      equipements_chauffage: null,
      equipements_lave_linge: null,
      equipements_seche_serviette: null,
      equipements_seche_cheveux: null,
      equipements_autre: null,
      equipements_autre_details: "",
      wc_separe: null,
      acces: "",
      elements_abimes: null,
      photos_rappels: {
        photos_salle_de_bain_taken: false,
        elements_abimes_taken: false
      }
    },

    salle_de_bain_6: {
      nom_description: "",
      equipements_douche: null,
      equipements_baignoire: null,
      equipements_douche_baignoire_combinees: null,
      equipements_double_vasque: null,
      equipements_wc: null,
      equipements_bidet: null,
      equipements_chauffage: null,
      equipements_lave_linge: null,
      equipements_seche_serviette: null,
      equipements_seche_cheveux: null,
      equipements_autre: null,
      equipements_autre_details: "",
      wc_separe: null,
      acces: "",
      elements_abimes: null,
      photos_rappels: {
        photos_salle_de_bain_taken: false,
        elements_abimes_taken: false
      }
    }
  },

  section_cuisine_1: {
    // Équipements principaux (checkboxes)
    equipements_refrigerateur: null,
    equipements_congelateur: null,
    equipements_mini_refrigerateur: null,
    equipements_cuisiniere: null,
    equipements_plaque_cuisson: null,
    equipements_four: null,
    equipements_micro_ondes: null,
    equipements_lave_vaisselle: null,
    equipements_cafetiere: null,
    equipements_bouilloire: null,
    equipements_grille_pain: null,
    equipements_blender: null,
    equipements_cuiseur_riz: null,
    equipements_machine_pain: null,
    equipements_lave_linge: null,
    equipements_autre: null,
    equipements_autre_details: "",

    // Réfrigérateur (conditionnel)
    refrigerateur_marque: "",
    refrigerateur_instructions: "",

    // Congélateur (conditionnel)
    congelateur_instructions: "",

    // Mini réfrigérateur (conditionnel)
    mini_refrigerateur_instructions: "",

    // Cuisinière (conditionnel)
    cuisiniere_marque: "",
    cuisiniere_type: "", // "Électrique", "Gaz", "Induction", "À bois"
    cuisiniere_nombre_feux: "",
    cuisiniere_instructions: "",

    // Plaque de cuisson (conditionnel)
    plaque_cuisson_marque: "",
    plaque_cuisson_type: "", // "Électrique", "Gaz", "Induction"
    plaque_cuisson_nombre_feux: "",
    plaque_cuisson_instructions: "",

    // Four (conditionnel)
    four_marque: "",
    four_type: "", // "Simple", "Double"
    four_instructions: "",

    // Micro-ondes (conditionnel)
    micro_ondes_instructions: "",

    // Lave-vaisselle (conditionnel)
    lave_vaisselle_instructions: "",

    // Cafetière (conditionnel)
    cafetiere_marque: "",
    cafetiere_instructions: "",
    cafetiere_cafe_fourni: "", // "Non", "Oui par le propriétaire", "Oui par la fée du logis"
    cafetiere_marque_cafe: "", // conditionnel si café fourni

    // Types cafetière (checkboxes multiples)
    cafetiere_type_filtre: null,
    cafetiere_type_expresso: null,
    cafetiere_type_piston: null,
    cafetiere_type_keurig: null,
    cafetiere_type_nespresso: null,
    cafetiere_type_manuelle: null,
    cafetiere_type_bar_grain: null,
    cafetiere_type_bar_moulu: null,

    // Bouilloire (conditionnel)
    bouilloire_instructions: "",

    // Grille-pain (conditionnel)
    grille_pain_instructions: "",

    // Blender (conditionnel)
    blender_instructions: "",

    // Cuiseur riz (conditionnel)
    cuiseur_riz_instructions: "",

    // Machine pain (conditionnel)
    machine_pain_instructions: "",

    // Éléments abîmés
    elements_abimes: null, // true/false/null

    // Photos rappels (VERSION LITE)
    photos_rappels: {
      refrigerateur_taken: false,
      congelateur_taken: false,
      mini_refrigerateur_taken: false,
      cuisiniere_taken: false,
      plaque_cuisson_taken: false,
      four_taken: false,
      micro_ondes_taken: false,
      lave_vaisselle_taken: false,
      cafetiere_taken: false,
      bouilloire_taken: false,
      grille_pain_taken: false,
      blender_taken: false,
      cuiseur_riz_taken: false,
      machine_pain_taken: false,
      elements_abimes_taken: false
    }
  },

  // Dans src/components/FormContext.jsx, remplacer :
  // section_cuisine_2: {},

  // Par cette structure complète :
  section_cuisine_2: {
    // Vaisselle (compteurs)
    vaisselle_assiettes_plates: 0,
    vaisselle_assiettes_dessert: 0,
    vaisselle_assiettes_creuses: 0,
    vaisselle_bols: 0,

    // Couverts (compteurs)
    couverts_verres_eau: 0,
    couverts_verres_vin: 0,
    couverts_tasses: 0,
    couverts_flutes_champagne: 0,
    couverts_mugs: 0,
    couverts_couteaux_table: 0,
    couverts_fourchettes: 0,
    couverts_couteaux_steak: 0,
    couverts_cuilleres_soupe: 0,
    couverts_cuilleres_cafe: 0,
    couverts_cuilleres_dessert: 0,

    // Ustensiles de cuisine (compteurs)
    ustensiles_poeles_differentes_tailles: 0,
    ustensiles_casseroles_differentes_tailles: 0,
    ustensiles_faitouts: 0,
    ustensiles_wok: 0,
    ustensiles_cocotte_minute: 0,
    ustensiles_couvercle_anti_eclaboussures: 0,
    ustensiles_robot_cuisine: 0,
    ustensiles_batteur_electrique: 0,
    ustensiles_couteaux_cuisine: 0,
    ustensiles_spatules: 0,
    ustensiles_ecumoire: 0,
    ustensiles_ouvre_boite: 0,
    ustensiles_rape: 0,
    ustensiles_tire_bouchon: 0,
    ustensiles_econome: 0,
    ustensiles_passoire: 0,
    ustensiles_planche_decouper: 0,
    ustensiles_rouleau_patisserie: 0,
    ustensiles_ciseaux_cuisine: 0,
    ustensiles_balance_cuisine: 0,
    ustensiles_bac_glacon: 0,
    ustensiles_pince_cuisine: 0,
    ustensiles_couteau_huitre: 0,
    ustensiles_verre_mesureur: 0,
    ustensiles_presse_agrume_manuel: 0,
    ustensiles_pichet: 0,

    // Plats et récipients (compteurs)
    plats_dessous_plat: 0,
    plats_plateau: 0,
    plats_saladiers: 0,
    plats_a_four: 0,
    plats_carafes: 0,
    plats_moules: 0,
    plats_theiere: 0,
    plats_cafetiere_piston_filtre: 0,
    plats_ustensiles_barbecue: 0,
    plats_gants_cuisine: 0,
    plats_maniques: 0,

    // Champs complémentaires
    autres_ustensiles: "",
    quantite_suffisante: null, // true/false/null
    quantite_insuffisante_details: "", // conditionnel si quantite_suffisante = false
    casseroles_poeles_testees: null, // true/false/null

    // Photos rappels
    photos_rappels: {
      photos_tiroirs_placards_taken: false
    }
  },

  section_salon_sam: {
    // Description générale
    description_generale: "",

    // Équipements (checkboxes)
    equipements_table_manger: null,
    equipements_chaises: null,
    equipements_canape: null,
    equipements_canape_lit: null,
    equipements_fauteuils: null,
    equipements_table_basse: null,
    equipements_television: null,
    equipements_cheminee: null,
    equipements_jeux_societe: null,
    equipements_livres_magazines: null,
    equipements_livres_jouets_enfants: null,
    equipements_climatisation: null,
    equipements_chauffage: null,
    equipements_autre: null,
    equipements_autre_details: "",

    // Cheminée (conditionnel)
    cheminee_type: "", // "Électrique", "Éthanol", "Gaz", "Poêle à granulés", "Bois", "Décorative"

    // Autres détails
    autres_equipements_details: "",
    nombre_places_table: "",

    // Éléments abîmés salon
    salon_elements_abimes: null, // true/false/null

    // Éléments abîmés salle à manger
    salle_manger_elements_abimes: null, // true/false/null

    // Photos rappels (VERSION LITE)
    photos_rappels: {
      photos_salon_sam_taken: false,
      salon_elements_abimes_taken: false,
      salle_manger_elements_abimes_taken: false
    }
  },

  section_equip_spe_exterieur: {
    // Questions racines
    dispose_exterieur: null,
    dispose_piscine: null,
    dispose_jacuzzi: null,
    dispose_cuisine_exterieure: null,

    // BRANCHE EXTÉRIEUR (conditionnel si dispose_exterieur = true)
    exterieur_type_espace: [], // array: "Balcon", "Terrasse", "Jardin", "Patio", "Aucun"
    exterieur_description_generale: "",
    exterieur_entretien_prestataire: null, // true/false/null
    exterieur_entretien_frequence: "", // conditionnel si entretien_prestataire = true
    exterieur_entretien_type_prestation: "", // conditionnel si entretien_prestataire = true
    exterieur_entretien_qui: "", // conditionnel si entretien_prestataire = false
    exterieur_equipements: [], // array: "Table extérieure", "Chaises", etc.
    exterieur_equipements_autre_details: "", // conditionnel si "Autre" dans equipements
    exterieur_nombre_chaises_longues: null, // conditionnel si "Chaises longues" sélectionné
    exterieur_nombre_parasols: null, // conditionnel si "Parasol" sélectionné
    exterieur_acces: "",
    exterieur_type_acces: "", // "Privé", "Partagé avec d'autres logements", etc.
    exterieur_type_acces_autre_details: "", // conditionnel si "Autre"

    // SOUS-BRANCHE BARBECUE (conditionnel si "Barbecue" dans exterieur_equipements)
    barbecue_instructions: "",
    barbecue_type: "",
    barbecue_combustible_fourni: null, // true/false/null
    barbecue_ustensiles_fournis: null, // true/false/null

    // BRANCHE PISCINE (conditionnel si dispose_piscine = true)
    piscine_type: "", // "Privée", "Publique ou partagée"
    piscine_acces: "", // "Intérieur", "Extérieur"
    piscine_dimensions: "",
    piscine_disponibilite: "", // "Disponible toute l'année", "Disponible à certaines périodes"
    piscine_periode_disponibilite: "", // conditionnel si "certaines périodes"
    piscine_heures: "", // "Ouverture 24h/24", "Heures d'ouverture spécifiques"
    piscine_horaires_ouverture: "", // conditionnel si "heures spécifiques"
    piscine_caracteristiques: [], // array: "Chauffée", "À débordement", etc.
    piscine_periode_chauffage: "", // conditionnel si "Chauffée" sélectionné
    piscine_entretien_prestataire: null, // true/false/null
    piscine_entretien_frequence: "", // conditionnel si entretien_prestataire = true
    piscine_entretien_type_prestation: "", // conditionnel si entretien_prestataire = true
    piscine_entretien_qui: "", // conditionnel si entretien_prestataire = false
    piscine_regles_utilisation: "",

    // BRANCHE JACUZZI (conditionnel si dispose_jacuzzi = true)
    jacuzzi_acces: "", // "Intérieur", "Extérieur"
    jacuzzi_entretien_prestataire: null, // true/false/null
    jacuzzi_entretien_frequence: "", // conditionnel si entretien_prestataire = true
    jacuzzi_entretien_type_prestation: "", // conditionnel si entretien_prestataire = true
    jacuzzi_entretien_qui: "", // conditionnel si entretien_prestataire = false
    jacuzzi_taille: "",
    jacuzzi_heures_utilisation: "",
    jacuzzi_instructions: "",

    // BRANCHE CUISINE EXTÉRIEURE (conditionnel si dispose_cuisine_exterieure = true)
    cuisine_ext_entretien_prestataire: null, // true/false/null
    cuisine_ext_entretien_frequence: "", // conditionnel si entretien_prestataire = true
    cuisine_ext_entretien_type_prestation: "", // conditionnel si entretien_prestataire = true
    cuisine_ext_entretien_qui: "", // conditionnel si entretien_prestataire = false
    cuisine_ext_superficie: "",
    cuisine_ext_type: "", // "Privée", "Publique ou partagée"
    cuisine_ext_caracteristiques: [], // array: "Four", "Évier"

    // Éléments abîmés (3 espaces différents)
    garage_elements_abimes: null, // true/false/null
    buanderie_elements_abimes: null, // true/false/null
    autres_pieces_elements_abimes: null, // true/false/null

    // Photos rappels (VERSION LITE)
    photos_rappels: {
      exterieur_photos_taken: false,
      barbecue_photos_taken: false,
      piscine_video_taken: false,
      jacuzzi_photos_taken: false,
      garage_elements_abimes_taken: false,
      buanderie_elements_abimes_taken: false,
      autres_pieces_elements_abimes_taken: false
    }
  },

  section_communs: {
    dispose_espaces_communs: null, // true/false/null
    description_generale: "",
    entretien_prestataire: null, // true/false/null
    entretien_frequence: "", // conditionnel si entretien_prestataire = true
    entretien_qui: "", // conditionnel si entretien_prestataire = false

    // Photos rappels
    photos_rappels: {
      photos_espaces_communs_taken: false
    }
  },

  section_teletravail: {
    equipements: [],
    equipements_autre_details: ""
  },

  section_bebe: {
    equipements: [],
    lit_bebe_type: "", // radio: "Lit pour bébé", "Parc de voyage", "Lit parapluie"
    lit_parapluie_disponibilite: "", // conditionnel si lit_bebe_type = "Lit parapluie"
    lit_stores_occultants: null, // boolean, conditionnel si lit_bebe_type = "Lit parapluie"

    chaise_haute_type: "", // radio: "Indépendante", "Pliable ou transformable", "Rehausseur", "Siège de table"
    chaise_haute_disponibilite: "", // radio: "Toujours disponible dans le logement", "Sur demande"
    chaise_haute_caracteristiques: [], // array: "Rembourrée", "Avec sangles ou harnais", "Avec plateau"
    chaise_haute_prix: "", // radio: "Compris dans votre séjour", "Disponible moyennant un supplément"

    jouets_tranches_age: [], // array: "0 à 2 ans", "2 à 5 ans", "5 à 10 ans", "Plus de 10 ans"

    equipements_autre_details: "",

    photos_rappels: {
      photos_equipements_bebe_taken: false
    }
  },

  section_guide_acces: {
    // Points de repère importants
    point_repere_principal: "", // Ex: "Panneau de rue", "Café en face", etc.

    // Description étapes d'accès
    description_acces: "", // Description détaillée du parcours

    // Éléments à photographier/filmer (conseils)
    elements_documenter: [], // Checklist des éléments à capturer

    // Difficultés d'accès identifiées
    difficultes_acces: [], // Problèmes potentiels à signaler

    // Conseils supplémentaires
    conseils_voyageurs: "", // Conseils spécifiques pour faciliter l'arrivée

    // Photos rappels (version lite)
    photos_rappels: {
      photos_etapes_acces_taken: false,
      video_acces_taken: false
    }
  },


  section_securite: {
    equipements: [],
    alarme_desarmement: "",
    equipements_autre_details: "",

    photos_rappels: {
      photos_equipements_securite_taken: false
    }
  },

  photos_prises: {},
  rappels_photos: []
}

export function FormProvider({ children }) {
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [saveStatus, setSaveStatus] = useState({
    saving: false,
    saved: false,
    error: null
  })

  // 🔥 État de navigation
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = sections.length

  // Flag pour distinguer changements utilisateur vs serveur
  const isUserChangeRef = useRef(false)
  const lastSaveRef = useRef(0)

  // Récupération utilisateur
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const updateField = useCallback((fieldPath, value) => {
    isUserChangeRef.current = true

    setFormData(prev => {
      const newData = { ...prev }
      const keys = fieldPath.split('.')
      let current = newData

      for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] === undefined || current[keys[i]] === null) {
          current[keys[i]] = {}
        } else if (typeof current[keys[i]] !== 'object') {
          current[keys[i]] = {}
        } else {
          current[keys[i]] = { ...current[keys[i]] }
        }
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      newData.updated_at = new Date().toISOString()

      return newData
    })
  }, [])

  const updateSection = useCallback((sectionName, newData) => {
    isUserChangeRef.current = true

    setFormData(prev => ({
      ...prev,
      [sectionName]: {
        ...(prev[sectionName] || {}),
        ...newData
      },
      updated_at: new Date().toISOString()
    }))
  }, [])

  const getField = useCallback((fieldPath) => {
    const keys = fieldPath.split('.')
    let current = formData

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return ""
      }
    }

    return current !== null && current !== undefined ? current : ""
  }, [formData])

  // Fonctions de navigation
  const next = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, totalSteps])

  const back = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const goTo = useCallback((step) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step)
    }
  }, [totalSteps])

  const getCurrentSection = useCallback(() => {
    return sections[currentStep]
  }, [currentStep])

  const handleSave = useCallback(async () => {
    if (!user?.id) {
      setSaveStatus({ saving: false, saved: false, error: 'Utilisateur non connecté' });
      return { success: false, error: 'Utilisateur non connecté' };
    }

    setSaveStatus({ saving: true, saved: false, error: null });

    try {
      const dataToSave = {
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      const result = await saveFiche(dataToSave, user.id);

      if (result.success) {
        setFormData(result.data);
        setSaveStatus({ saving: false, saved: true, error: null });
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, saved: false }))
        }, 3000)
        return { success: true, data: result.data };
      } else {
        setSaveStatus({ saving: false, saved: false, error: result.message });
        return { success: false, error: result.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Erreur de connexion';
      setSaveStatus({ saving: false, saved: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [formData, user])

  // Auto-save automatique avec debounce
  useEffect(() => {
    // Ne rien faire si pas d'utilisateur
    if (!user?.id) return

    // Ne rien faire si c'est une mise à jour interne (pas utilisateur)
    if (!isUserChangeRef.current) return

    // Ne rien faire si déjà en train de sauvegarder
    if (saveStatus.saving) return

    // Anti-spam : minimum 1.5s entre deux sauvegardes
    const now = Date.now()
    if (now - lastSaveRef.current < 1500) return

    // Debounce de 2 secondes
    const timeout = setTimeout(async () => {
      isUserChangeRef.current = false // Reset le flag avant de sauvegarder
      lastSaveRef.current = Date.now()
      await handleSave()
    }, 5000)

    return () => clearTimeout(timeout)
  }, [formData, user?.id, saveStatus.saving, handleSave])

  const handleLoad = useCallback(async (ficheId) => {
    setSaveStatus({ saving: true, saved: false, error: null });
    try {
      const result = await loadFiche(ficheId)

      if (result.success) {
        setFormData(result.data)
        setSaveStatus({ saving: false, saved: true, error: null });
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, saved: false }))
        }, 3000)
        return { success: true, data: result.data }
      } else {
        setSaveStatus({ saving: false, saved: false, error: result.message });
        return { success: false, error: result.message }
      }
    } catch (error) {
      setSaveStatus({ saving: false, saved: false, error: error.message || 'Erreur de connexion' });
      return { success: false, error: 'Erreur de connexion' }
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setCurrentStep(0) // Reset de l'étape
    setSaveStatus({ saving: false, saved: false, error: null })
  }, [])

  const finaliserFiche = useCallback(async () => {
    setSaveStatus({ saving: true, saved: false, error: null })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const updatedFormData = { ...formData, statut: 'Complété' }
      const result = await saveFiche(updatedFormData, user.id)

      if (result.success) {
        setFormData(result.data)
        setSaveStatus({ saving: false, saved: true, error: null })
        return { success: true }
      } else {
        setSaveStatus({ saving: false, saved: false, error: result.message })
        return { success: false, error: result.message }
      }
    } catch (error) {
      setSaveStatus({ saving: false, saved: false, error: error.message })
      return { success: false, error: error.message }
    }
  }, [formData])

  return (
    <FormContext.Provider value={{
      // Données
      formData,
      updateField,
      updateSection,
      getField,

      // Persistance
      handleSave,
      handleLoad,
      loadFicheData: handleLoad,
      saveStatus,
      resetForm,
      finaliserFiche,

      // Navigation
      currentStep,
      totalSteps,
      sections,
      next,
      back,
      goTo,
      getCurrentSection
    }}>
      {children}
    </FormContext.Provider>
  )
}

export function useForm() {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('useForm must be used within a FormProvider')
  }
  return {
    ...context,
    loadFicheData: context.handleLoad // Alias pour compatibilité
  }
}