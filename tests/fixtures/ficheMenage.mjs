// Fiches SYNTHÉTIQUES pour la Fiche Ménage — tests et preuve visuelle.
//
// Aucune donnée de production : tout est inventé, y compris les codes. Les valeurs
// « secrètes » portent un marqueur reconnaissable (SECRET_…) pour que les tests
// puissent affirmer qu'elles ne figurent NULLE PART dans le document.

import { initialFormData } from '../../src/lib/formDefaults.js'

const base = () => structuredClone(initialFormData)

// Valeurs qui ne doivent JAMAIS sortir dans la Fiche Ménage.
export const SECRETS = {
  telephone: '06 12 34 56 78',
  email: 'proprio-secret@example.org',
  masterpinTtlock: 'SECRET_MASTERPIN_TT',
  codeProprietaireTtlock: 'SECRET_PROPRIO_TT',
  masterpinIgloo: 'SECRET_MASTERPIN_IG',
  codeVoyageurIgloo: 'SECRET_VOYAGEUR_IG',
  codeProprietaireIgloo: 'SECRET_PROPRIO_IG',
  codeMenageIgloo: 'ORPHELIN_MENAGE_IG',
  wifiSsid: 'SECRET_SSID',
  wifiMdp: 'SECRET_WIFI_MDP',
  airbnbEmail: 'compte-airbnb@example.org',
  airbnbMdp: 'SECRET_AIRBNB',
  bookingMdp: 'SECRET_BOOKING',
  chauffageInstructions: 'SECRET_CHAUFFAGE_GENERAL thermostat à 19 °C',
  chauffageType: 'Central',
  tvServices: 'Netflix',
  tvConsoles: 'PlayStation',
  guideGenere: 'SECRET_GUIDE_VOYAGEURS bienvenue chers voyageurs',
  conseilsVoyageurs: 'SECRET_CONSEILS_VOYAGEURS',
  noteGrille: 'SECRET_OBS_GRILLE',
  quantiteInsuffisante: 'SECRET_QUANTITE_INSUFFISANTE',
  piscineRegles: 'SECRET_REGLES_PISCINE',
  lavelingePrix: 'Supplément',
  maintenance: 'Intervention artisan',
}

// Fiche RICHE : toutes les rubriques utiles remplies, plus TOUS les champs qui doivent
// rester hors document (pour prouver qu'ils n'y sont pas).
export function ficheRiche() {
  const f = base()
  f.id = 'fiche-test-riche'
  f.nom = 'Appartement Dupont — Vieux-Port'
  f.fields_locked = true

  f.section_proprietaire = {
    prenom: 'Camille', nom: 'Dupont',
    email: SECRETS.email, telephone: SECRETS.telephone,
    adresse: { rue: '12 quai du Port', complement: 'Résidence Les Mouettes', ville: 'Marseille', codePostal: '13002', pays: 'FR' },
  }
  f.section_logement = {
    ...f.section_logement,
    type_propriete: 'Appartement', surface: '68', typologie: 'T3', nombre_personnes_max: '5', nombre_lits: '3',
    appartement: { nom_residence: 'Les Mouettes', batiment: 'B', acces: 'Entrée par le hall B, ascenseur à droite', etage: '3', numero_porte: '12' },
  }
  f.section_avis = {
    ...f.section_avis,
    grille_proprete_generale_note: 3, grille_proprete_generale_obs: SECRETS.noteGrille,
    quartier_securite: 'Calme',
  }
  f.section_instructions_menage = {
    ...f.section_instructions_menage,
    type_premier_menage: 'Approfondi',
    type_premiere_maintenance: SECRETS.maintenance,
    consignes_generales: "Passer l'aspirateur sous le canapé. Aérer 10 minutes avant de partir. Vérifier que le lave-vaisselle est vide.",
    produits_materiel: 'Produit sol X uniquement. Pas de javel sur le parquet. Éponge non abrasive sur la plaque à induction.',
    kit_achat_par_prestataire: true,
    kit_installation_par_prestataire: true,
    kit_composition: '1 bouteille de vin, 2 verres et le mot de bienvenue sur la table de la cuisine.',
    points_vigilance: 'Bien refermer le velux de la chambre 2. Couper la clim avant de partir. Le volet du bas se bloque : ne pas forcer.',
    photos_rappels: { etat_logement_video_taken: true, consignes_videos_taken: true, kit_photos_taken: true },
  }
  f.section_clefs = {
    ...f.section_clefs,
    boiteType: 'TTlock',
    emplacementBoite: "À gauche de la porte d'entrée, sous l'interphone",
    emplacementEmballageBoite: 'Dans le placard du couloir',
    ttlock: { masterpinConciergerie: SECRETS.masterpinTtlock, codeProprietaire: SECRETS.codeProprietaireTtlock, codeMenage: '4521' },
    // Valeurs orphelines d'un ancien type Igloohome : jamais relues.
    igloohome: { masterpinConciergerie: SECRETS.masterpinIgloo, codeVoyageur: SECRETS.codeVoyageurIgloo, codeProprietaire: SECRETS.codeProprietaireIgloo, codeMenage: SECRETS.codeMenageIgloo },
    interphone: true, interphoneDetails: 'Sonner « DUPONT », le portier ouvre après le bip',
    tempoGache: false,
    digicode: true, digicodeDetails: 'Tapez 18B42 puis #',
    clefs: { precision: '2 clés : porte palière + boîte aux lettres', prestataire: true, details: 'Remises en mains propres le 3 septembre' },
    photos_rappels: { emplacement_taken: true, clefs_taken: true },
  }
  f.section_airbnb = { annonce_active: true, url_annonce: 'https://airbnb.example/x', identifiants_obtenus: true, email_compte: SECRETS.airbnbEmail, mot_passe: SECRETS.airbnbMdp, explication_refus: '' }
  f.section_booking = { ...f.section_booking, annonce_active: true, mot_passe: SECRETS.bookingMdp }
  f.section_exigences = { ...f.section_exigences, animaux_acceptes: 'oui', animaux_commentaire: 'Petits chiens uniquement — prévoir un passage aspirateur soigné.' }
  f.section_gestion_linge = {
    ...f.section_gestion_linge,
    dispose_de_linge: true,
    inventaire_140x200: { couettes: '1', oreillers: '2', draps_housses: '2', housses_couette: '2', protections_matelas: '1', taies_oreillers: '4' },
    inventaire_160x200: { couettes: '1', oreillers: '2', draps_housses: '2', housses_couette: '2', protections_matelas: '1', taies_oreillers: '2' },
    inventaire_autres: { draps_bain: '6', petites_serviettes: '6', tapis_bain: '2', torchons: '4', plaids: '', oreillers_decoratifs: '' },
    etat_propre: true, etat_usage: true, etat_informations: 'Une housse de couette 140 légèrement tachée (lavable).',
    emplacement_description: 'Malle en osier dans le placard de la chambre 1',
    emplacement_code_cadenas: '2580',
    photos_rappels: { linge_taken: true, emplacement_taken: true },
  }
  f.section_equipements = {
    ...f.section_equipements,
    poubelle_emplacement: 'Local à gauche en sortant du hall B',
    poubelle_ramassage: 'Lundi et jeudi soir (bac jaune le mercredi)',
    disjoncteur_emplacement: "Placard de l'entrée, en haut",
    vanne_eau_emplacement: 'Sous l\'évier de la cuisine',
    systeme_chauffage_eau: 'Ballon d\'eau chaude',
    chauffage_eau_emplacement: 'Placard de la salle de bains',
    lave_linge: true, lave_linge_prix: SECRETS.lavelingePrix, lave_linge_emplacement: 'Salle de bains', lave_linge_instructions: 'Programme coton 40°, ne pas utiliser le sèche-linge intégré',
    seche_linge: true, seche_linge_emplacement: 'Buanderie', seche_linge_instructions: 'Vider le bac à eau après chaque cycle',
    fer_repasser: true, etendoir: true, ascenseur: true, compacteur_dechets: false,
    chauffage: true, chauffage_type: SECRETS.chauffageType, chauffage_instructions: SECRETS.chauffageInstructions,
    climatisation: true, climatisation_type: 'Individuelle par pièce', climatisation_instructions: 'Télécommande sur la table basse',
    tv: true, tv_type: 'Écran plat', tv_services: [SECRETS.tvServices], tv_consoles: [SECRETS.tvConsoles],
    wifi_statut: 'oui', wifi_nom_reseau: SECRETS.wifiSsid, wifi_mot_de_passe: SECRETS.wifiMdp, wifi_details: 'Box dans le salon',
    parking_type: 'sur_place', parking_sur_place_types: ['Parking sous-terrain'], parking_sur_place_details: 'Place n° 27, niveau -1, badge dans la boîte à clés',
    menage_aspirateur_type: 'Sans fil', menage_serpillere_type: 'Serpillière MOP plate (microfibres)',
    menage_autres_description: 'Chiffons microfibres et produits sous l\'évier. Balai et balayette dans le placard de l\'entrée.',
    photos_rappels: { ...f.section_equipements.photos_rappels, poubelle_taken: true, menage_aspirateur_video_taken: true },
  }
  f.section_consommables = {
    ...f.section_consommables,
    fournis_par_prestataire: true,
    papier_toilette: true, savon_mains: true, produit_vaisselle: true, eponge_cuisine: true, sel_poivre_sucre: true,
    cafe_the: true, essuie_tout: true, sac_poubelle: true, produit_sol: true, produit_wc_javel: true,
    consommables_recommandes_autre: true, consommables_recommandes_autre_details: 'Filtres à café n° 4',
    gel_douche: true, shampoing: true,
    cafe_nespresso: true,
  }
  f.section_visite = {
    ...f.section_visite,
    pieces_chambre: true, nombre_chambres: '2', pieces_salon: true, pieces_salle_bains: true, nombre_salles_bains: '1',
    pieces_cuisine: true, pieces_terrasse: true,
    photos_rappels: { video_visite_taken: true },
  }
  f.section_chambres.chambre_1 = {
    ...f.section_chambres.chambre_1,
    nom_description: 'Chambre parentale', lit_queen_160_200: 1,
    equipements_draps_fournis: true, equipements_climatisation: true, equipements_espace_rangement: true,
    equipements_stores: true, equipements_oreillers_couvertures_sup: true, equipements_cintres: true,
    elements_abimes: true,
    photos_rappels: { photos_chambre_taken: true, elements_abimes_taken: true },
  }
  f.section_chambres.chambre_2 = {
    ...f.section_chambres.chambre_2,
    nom_description: 'Chambre enfants', lit_simple_90_190: 2, lits_superposes_90_190: 0,
    equipements_draps_fournis: false, equipements_lit_parapluie_60_120: true, equipements_stores: true,
    equipements_autre: true, equipements_autre_details: 'Veilleuse à laisser branchée',
  }
  f.section_salle_de_bains.salle_de_bain_1 = {
    ...f.section_salle_de_bains.salle_de_bain_1,
    nom_description: 'Salle de bains principale',
    equipements_douche: true, equipements_wc: true, wc_separe: false, equipements_seche_serviette: true,
    equipements_seche_cheveux: true, equipements_lave_linge: true, acces: 'privee',
  }
  f.section_cuisine_1 = {
    ...f.section_cuisine_1,
    equipements_refrigerateur: true, refrigerateur_marque: 'Bosch', refrigerateur_instructions: 'Dégivrer le compartiment congélation une fois par mois',
    equipements_plaque_cuisson: true, plaque_cuisson_type: 'Induction', plaque_cuisson_nombre_feux: '4',
    equipements_four: true, four_type: 'Simple', four_instructions: 'Pyrolyse : ne pas lancer avant un départ',
    equipements_lave_vaisselle: true, lave_vaisselle_instructions: 'Sel et liquide de rinçage sous l\'évier',
    equipements_cafetiere: true, cafetiere_type_nespresso: true, cafetiere_cafe_fourni: 'Oui par la femme de ménage', cafetiere_marque_cafe: 'Nespresso Volluto',
    equipements_bouilloire: true, equipements_micro_ondes: true,
    elements_abimes: false,
    photos_rappels: { ...f.section_cuisine_1.photos_rappels, four_taken: true },
  }
  f.section_cuisine_2 = {
    ...f.section_cuisine_2,
    vaisselle_assiettes_plates: 8, vaisselle_assiettes_dessert: 8, vaisselle_assiettes_creuses: 6, vaisselle_bols: 6,
    couverts_verres_eau: 8, couverts_verres_vin: 8, couverts_tasses: 6, couverts_mugs: 6,
    couverts_couteaux_table: 8, couverts_fourchettes: 8, couverts_cuilleres_soupe: 8, couverts_cuilleres_cafe: 8,
    ustensiles_poeles_differentes_tailles: 2, ustensiles_casseroles_differentes_tailles: 3, ustensiles_couteaux_cuisine: 3,
    ustensiles_spatules: 2, ustensiles_passoire: 1, ustensiles_planche_decouper: 2, ustensiles_tire_bouchon: 1,
    plats_saladiers: 2, plats_a_four: 2, plats_carafes: 1, plats_maniques: 2,
    autres_ustensiles: 'Machine à raclette dans le placard du haut',
    quantite_suffisante: false, quantite_insuffisante_details: SECRETS.quantiteInsuffisante,
    casseroles_poeles_testees: true,
  }
  f.section_salon_sam = {
    ...f.section_salon_sam,
    description_generale: 'Grand salon lumineux ouvert sur la terrasse, parquet chêne.',
    equipements_table_manger: true, equipements_chaises: true, equipements_canape: true, equipements_canape_lit: true,
    canape_lit_double: true, equipements_table_basse: true, equipements_television: true, equipements_jeux_societe: true,
    nombre_places_table: '6', autres_equipements_details: 'Enceinte Bluetooth sur l\'étagère',
    salon_elements_abimes: false, salle_manger_elements_abimes: true,
  }
  f.section_equip_spe_exterieur = {
    ...f.section_equip_spe_exterieur,
    dispose_exterieur: true, exterieur_type_espace: ['Terrasse'], exterieur_description_generale: 'Terrasse de 12 m² plein sud, sol en bois composite.',
    exterieur_type_acces: 'Privé', exterieur_acces: 'Directement depuis le salon',
    exterieur_equipements: ['Table extérieure', 'Chaises', 'Chaises longues', 'Barbecue', 'Parasol'],
    exterieur_nombre_chaises_longues: 2, exterieur_nombre_parasols: 1,
    exterieur_entretien_prestataire: true, exterieur_entretien_frequence: 'À chaque passage', exterieur_entretien_type_prestation: 'Balayage, nettoyage de la table et des chaises',
    barbecue_type: 'Gaz', barbecue_instructions: 'Nettoyer la grille après chaque séjour, vérifier la bouteille', barbecue_combustible_fourni: true, barbecue_ustensiles_fournis: true,
    dispose_piscine: true, piscine_acces: 'Extérieur', piscine_entretien_prestataire: false, piscine_entretien_qui: 'Société AquaNet, le mardi',
    piscine_regles_utilisation: SECRETS.piscineRegles, piscine_dimensions: '8 × 4',
    dispose_jacuzzi: true, jacuzzi_acces: 'Extérieur', jacuzzi_entretien_prestataire: true, jacuzzi_entretien_frequence: 'Hebdomadaire', jacuzzi_entretien_type_prestation: 'Contrôle du pH et ajout des pastilles',
    jacuzzi_instructions: 'Remettre la bâche après usage',
    garage_elements_abimes: true,
  }
  f.section_communs = { ...f.section_communs, dispose_espaces_communs: true, description_generale: 'Hall et escalier B partagés avec 6 logements', entretien_prestataire: false, entretien_qui: 'Syndic de copropriété' }
  f.section_guide_acces = {
    ...f.section_guide_acces,
    point_repere_principal: 'Pharmacie du Port, en face de l\'immeuble',
    description_acces: 'Depuis la pharmacie, traverser ; porte cochère bleue, hall B au fond de la cour à droite.',
    difficultes_acces: ['Pas de place pour se garer devant', 'Ascenseur parfois en panne'],
    conseils_voyageurs: SECRETS.conseilsVoyageurs,
    guide_genere: SECRETS.guideGenere, guide_genere_at: '2026-09-01T10:00:00.000Z',
    photos_rappels: { photos_etapes_acces_taken: true, video_acces_taken: true },
  }
  f.section_securite = {
    equipements: ['Détecteur de fumée', 'Extincteur', 'Système d\'alarme', 'Autre (veuillez préciser)'],
    alarme_desarmement: 'Boîtier dans l\'entrée : code 7788 puis touche verte, 30 secondes pour sortir',
    equipements_autre_details: 'Couverture anti-feu dans la cuisine',
    photos_rappels: { photos_equipements_securite_taken: true },
  }
  return f
}

// Fiche PARTIELLE : quelques rubriques seulement (boîte Igloohome, pas de linge
// détaillé, pas de pièces), pour vérifier que les parties vides disparaissent.
export function fichePartielle() {
  const f = base()
  f.id = 'fiche-test-partielle'
  f.nom = 'Studio Lemaire'
  f.section_proprietaire = { ...f.section_proprietaire, prenom: 'Inès', nom: 'Lemaire', adresse: { rue: '4 rue des Lices', complement: '', ville: 'Angers', codePostal: '49100', pays: 'FR' } }
  f.section_logement = { ...f.section_logement, type_propriete: 'Studio', surface: '24', studio: { nom_residence: '', batiment: '', acces: '', etage: '2', numero_porte: '' } }
  f.section_clefs = {
    ...f.section_clefs,
    boiteType: 'Igloohome',
    emplacementBoite: 'Grille du jardin, côté rue',
    igloohome: { masterpinConciergerie: SECRETS.masterpinIgloo, codeVoyageur: SECRETS.codeVoyageurIgloo, codeProprietaire: SECRETS.codeProprietaireIgloo, codeMenage: '9931' },
  }
  f.section_instructions_menage = { ...f.section_instructions_menage, type_premier_menage: 'Classique', points_vigilance: 'Ne pas déplacer le tapis du salon (cache une rayure du parquet).' }
  f.section_consommables = { ...f.section_consommables, fournis_par_prestataire: false, cafe_soluble: true }
  f.section_equipements = { ...f.section_equipements, poubelle_emplacement: 'Bacs dans la cour', chauffage: true, chauffage_type: SECRETS.chauffageType, chauffage_instructions: SECRETS.chauffageInstructions }
  return f
}

// Fiche PRESQUE VIDE : un nom, une adresse, rien pour le ménage.
export function fichePresqueVide() {
  const f = base()
  f.id = 'fiche-test-vide'
  f.nom = 'Maison Garnier'
  f.section_proprietaire = { ...f.section_proprietaire, nom: 'Garnier', adresse: { ...f.section_proprietaire.adresse, ville: 'Nantes', pays: 'FR' } }
  return f
}

// Fiche HÉRITÉE : remplie avant le déplacement des champs. Le type de 1er ménage est
// encore dans section_avis, les animaux encore dans section_equipements.
export function ficheHeritee() {
  const f = base()
  f.id = 'fiche-test-heritee'
  f.nom = 'Gîte des Vignes'
  f.section_avis = { ...f.section_avis, type_premier_menage: 'Remise en état', type_premiere_maintenance: 'Approfondi', photos_rappels: { video_globale_taken: false, vis_a_vis_taken: false, etat_logement_video_taken: true } }
  f.section_instructions_menage = { ...f.section_instructions_menage, type_premier_menage: null }
  f.section_equipements = { ...f.section_equipements, animaux_acceptes: true, animaux_commentaire: 'Chien du propriétaire présent parfois' }
  f.section_exigences = { ...f.section_exigences, animaux_acceptes: '' }
  return f
}
