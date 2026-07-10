// src/lib/supabaseHelpers.js - VERSION FICHE LITE
import { supabase, safeSupabaseQuery } from '../supabaseClient'

// 🎯 MAPPING SIMPLE pour fiche_lite (JSONB)
export const mapFormDataToSupabase = (formData) => {
  return {
    nom: formData.nom || 'Nouvelle fiche',
    statut: formData.statut || 'Brouillon',
    
    // Toutes les sections en JSONB (directement)
    section_proprietaire: formData.section_proprietaire || {},
    section_logement: formData.section_logement || {},
    section_avis: formData.section_avis || {},
    section_clefs: formData.section_clefs || {},
    section_airbnb: formData.section_airbnb || {},
    section_booking: formData.section_booking || {},
    section_reglementation: formData.section_reglementation || {},
    section_exigences: formData.section_exigences || {},
    section_gestion_linge: formData.section_gestion_linge || {},
    section_equipements: formData.section_equipements || {},
    section_consommables: formData.section_consommables || {},
    section_visite: formData.section_visite || {},
    section_chambres: formData.section_chambres || {},
    section_salle_de_bains: formData.section_salle_de_bains || {},
    section_cuisine_1: formData.section_cuisine_1 || {},
    section_cuisine_2: formData.section_cuisine_2 || {},
    section_salon_sam: formData.section_salon_sam || {},
    section_equip_spe_exterieur: formData.section_equip_spe_exterieur || {},
    section_communs: formData.section_communs || {},
    section_teletravail: formData.section_teletravail || {},
    section_bebe: formData.section_bebe || {},
    section_guide_acces: formData.section_guide_acces || {},
    section_securite: formData.section_securite || {},
    
    // Gestion photos version lite
    photos_prises: formData.photos_prises || {},
    rappels_photos: formData.rappels_photos || [],
    
    updated_at: new Date().toISOString()
  }
}

// 🎯 MAPPING SIMPLE de Supabase vers FormContext
export const mapSupabaseToFormData = (supabaseData) => {
  return {
    id: supabaseData.id,
    user_id: supabaseData.user_id,
    nom: supabaseData.nom,
    statut: supabaseData.statut,
    created_at: supabaseData.created_at,
    updated_at: supabaseData.updated_at, 
    
    // Sections JSONB (directement)
    section_proprietaire: supabaseData.section_proprietaire || {},
    section_logement: supabaseData.section_logement || {},
    section_avis: supabaseData.section_avis || {},
    section_clefs: supabaseData.section_clefs || {},
    section_airbnb: supabaseData.section_airbnb || {},
    section_booking: supabaseData.section_booking || {},
    section_reglementation: supabaseData.section_reglementation || {},
    section_exigences: supabaseData.section_exigences || {},
    section_gestion_linge: supabaseData.section_gestion_linge || {},
    section_equipements: supabaseData.section_equipements || {},
    section_consommables: supabaseData.section_consommables || {},
    section_visite: supabaseData.section_visite || {},
    section_chambres: supabaseData.section_chambres || {},
    section_salle_de_bains: supabaseData.section_salle_de_bains || {},
    section_cuisine_1: supabaseData.section_cuisine_1 || {},
    section_cuisine_2: supabaseData.section_cuisine_2 || {},
    section_salon_sam: supabaseData.section_salon_sam || {},
    section_equip_spe_exterieur: supabaseData.section_equip_spe_exterieur || {},
    section_communs: supabaseData.section_communs || {},
    section_teletravail: supabaseData.section_teletravail || {},
    section_bebe: supabaseData.section_bebe || {},
    section_guide_acces: supabaseData.section_guide_acces || {},
    section_securite: supabaseData.section_securite || {},
    
    // Gestion photos version lite
    photos_prises: supabaseData.photos_prises || {},
    rappels_photos: supabaseData.rappels_photos || []
  }
}

// 💾 Sauvegarder une fiche LITE
export const saveFiche = async (formData, userId) => {
  try {
    const supabaseData = mapFormDataToSupabase(formData)
    supabaseData.user_id = userId
    
    let result
    
    if (formData.id) {
      // Mise à jour d'une fiche existante
      result = await safeSupabaseQuery(
        supabase
          .from('fiche_lite')  // ← CHANGÉ ICI
          .update(supabaseData)
          .eq('id', formData.id)
          .select()
          .single()
      )
    } else {
      // Création d'une nouvelle fiche
      result = await safeSupabaseQuery(
        supabase
          .from('fiche_lite')  // ← CHANGÉ ICI
          .insert(supabaseData)
          .select()
          .single()
      )
    }
    
    if (result.error) {
      throw result.error
    }
    
    return {
      success: true,
      data: mapSupabaseToFormData(result.data),
      message: 'Fiche sauvegardée avec succès'
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    return {
      success: false,
      error: error.message,
      message: 'Erreur lors de la sauvegarde'
    }
  }
}

// 📖 Charger une fiche LITE
export const loadFiche = async (ficheId) => {
  try {
    const result = await safeSupabaseQuery(
      supabase
        .from('fiche_lite')  // ← CHANGÉ ICI
        .select('*')
        .eq('id', ficheId)
        .single()
    )
    
    if (result.error) {
      throw result.error
    }
    
    return {
      success: true,
      data: mapSupabaseToFormData(result.data),
      message: 'Fiche chargée avec succès'
    }
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    return {
      success: false,
      error: error.message,
      message: 'Erreur lors du chargement'
    }
  }
}

// 🗑️ Supprimer une fiche LITE
export const deleteFiche = async (ficheId) => {
  try {
    const { error } = await supabase
      .from('fiche_lite')
      .delete()
      .eq('id', ficheId)
    
    if (error) {
      throw error
    }
    
    return {
      success: true,
      message: 'Fiche supprimée avec succès'
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return {
      success: false,
      error: error.message,
      message: 'Erreur lors de la suppression'
    }
  }
}

// 🔄 Mettre à jour le statut d'une fiche
export const updateFicheStatut = async (ficheId, newStatut) => {
  try {
    const { data, error } = await supabase
      .from('fiche_lite')  // ← CHANGÉ ICI
      .update({ 
        statut: newStatut,
        updated_at: new Date().toISOString()
      })
      .eq('id', ficheId)
      .select('id, nom, statut, updated_at')
      .single()

    if (error) {
      return { 
        success: false, 
        error: error.message,
        message: `Impossible de modifier la fiche`
      }
    }

    return { 
      success: true, 
      data,
      message: `Fiche mise à jour avec succès`
    }
  } catch (e) {
    return {
      success: false,
      error: e.message,
      message: 'Erreur de connexion'
    }
  }
}

// 📦 Archiver / désarchiver une fiche (réversible).
//
// On pose (ou retire) un horodatage dans `archived_at` ; le `statut` d'origine
// (Brouillon / Complété) n'est JAMAIS touché, c'est ce qui permet à la fiche de
// retrouver sa place exacte au désarchivage.
//
// `updated_at` n'est volontairement PAS bumpé : ranger une fiche n'est pas la modifier,
// et la liste est triée par `updated_at` — archiver ne doit pas la faire remonter.
export const setFicheArchived = async (ficheId, archived) => {
  try {
    const { error } = await supabase
      .from('fiche_lite')
      .update({ archived_at: archived ? new Date().toISOString() : null })
      .eq('id', ficheId)

    if (error) throw error

    return {
      success: true,
      message: archived ? 'Fiche archivée' : 'Fiche désarchivée'
    }
  } catch (error) {
    console.error('Erreur lors de l\'archivage:', error)
    return {
      success: false,
      error: error.message,
      message: archived ? 'Impossible d\'archiver la fiche' : 'Impossible de désarchiver la fiche'
    }
  }
}

  // 📋 Récupérer toutes les fiches d'un utilisateur
  export const getUserFiches = async (userId) => {
    try {
      const result = await safeSupabaseQuery(
        supabase
          .from('fiche_lite')
          // archived_at : NULL = fiche active, non NULL = fiche archivée (filtre « Archivé »).
          .select('id, nom, statut, created_at, updated_at, archived_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
      )
      
      if (result.error) {
        throw result.error
      }
      
      return {
        success: true,
        data: result.data || [],
        message: 'Fiches récupérées avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la récupération:', error)
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors de la récupération'
      }
    }
  }

  // ============================================
  // BRAND CHARTER HELPERS
  // ============================================

  export async function getUserBrandCharter(userId) {
    const { data, error } = await supabase
      .from('user_brand_charter')
      .select('*')
      .eq('user_id', userId)
      .single()
  
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching brand charter:', error)
      throw error
    }
  
    return data
  }

  export async function createBrandCharter(userId, charterData) {
    const { data, error } = await supabase
      .from('user_brand_charter')
      .insert({
        user_id: userId,
        
        // Étape 1 : Votre conciergerie
        conciergerie_name: charterData.conciergerie_name,
        years_experience: charterData.years_experience,
        team_structure: charterData.team_structure,
        
        // Étape 2 : Vos objectifs de communication
        communication_goals: charterData.communication_goals,
        communication_goals_other: charterData.communication_goals_other,
        communication_habits: charterData.communication_habits,
        
        // Étape 3 : Parlez-nous de votre activité
        business_description: charterData.business_description,
        
        // Étape 4 : Qui sont vos clients idéaux ?
        target_audience: charterData.target_audience,
        
        // Étape 5 : Où se trouvent vos logements ?
        location: charterData.location,
        
        // Étape 6 : Votre style et ton de communication
        tone_of_voice: charterData.tone_of_voice, // TEXT[]
        recurring_keywords: charterData.recurring_keywords,
        pronoun_tu_vous: charterData.pronoun_tu_vous,
        pronoun_je_neutral: charterData.pronoun_je_neutral,
        
        // Étape 7 : Votre palette de couleur
        visual_style: charterData.visual_style, // TEXT[]
        has_logo: charterData.has_logo,
        color_palette: charterData.color_palette, // JSONB
        
        // Champs legacy (conservés pour compatibilité)
        brand_style: charterData.brand_style || [], // TEXT[]
        keywords: charterData.keywords || [],
        photos_urls: charterData.photos_urls || []
      })
      .select()
      .single()
  
    if (error) {
      console.error('Error creating brand charter:', error)
      throw error
    }
  
    return data
  }

  export async function updateBrandCharter(userId, charterData) {
    const { data, error } = await supabase
      .from('user_brand_charter')
      .update({
        // Étape 1
        conciergerie_name: charterData.conciergerie_name,
        years_experience: charterData.years_experience,
        team_structure: charterData.team_structure,
        
        // Étape 2
        communication_goals: charterData.communication_goals,
        communication_goals_other: charterData.communication_goals_other,
        communication_habits: charterData.communication_habits,
        
        // Étape 3
        business_description: charterData.business_description,
        
        // Étape 4
        target_audience: charterData.target_audience,
        
        // Étape 5
        location: charterData.location,
        
        // Étape 6
        tone_of_voice: charterData.tone_of_voice,
        recurring_keywords: charterData.recurring_keywords,
        pronoun_tu_vous: charterData.pronoun_tu_vous,
        pronoun_je_neutral: charterData.pronoun_je_neutral,
        
        // Étape 7
        visual_style: charterData.visual_style,
        has_logo: charterData.has_logo,
        color_palette: charterData.color_palette,
        
        // Legacy
        brand_style: charterData.brand_style || [],
        keywords: charterData.keywords || [],
        photos_urls: charterData.photos_urls || [],
        
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()
  
    if (error) {
      console.error('Error updating brand charter:', error)
      throw error
    }
  
    return data
  }