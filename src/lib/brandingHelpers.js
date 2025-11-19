export function generateBrandingContext(charter) {
    if (!charter) return null
  
    return {
      conciergerie_name: charter.conciergerie_name ?? null,
      years_experience: charter.years_experience ?? null,
      team_structure: charter.team_structure ?? null,
      communication_goals: charter.communication_goals ?? [],
      communication_goals_other: charter.communication_goals_other ?? null,
      communication_habits: charter.communication_habits ?? null,
      business_description: charter.business_description ?? null,
      target_audience: charter.target_audience ?? null,
      location: charter.location ?? null,
      tone_of_voice: charter.tone_of_voice ?? [],
      recurring_keywords: charter.recurring_keywords ?? null,
      pronoun_tu_vous: charter.pronoun_tu_vous ?? null,
      pronoun_je_neutral: charter.pronoun_je_neutral ?? null,
      visual_style: charter.visual_style ?? [],
      has_logo: charter.has_logo ?? null,
      color_palette: charter.color_palette ?? null,
    }
  }
  