// Accès bas niveau à une ligne brute de la table `fiche_lite`. Différence majeure
// avec FL : `fiche_lite` stocke chaque section dans une COLONNE JSONB
// (`section_logement`, `section_avis`, …), là où FL aplatit en colonnes
// `{section}_{champ}`. Ces helpers normalisent les valeurs lues DANS une section
// (objet JSONB) : null/vide, booléens 3 états, arrays, nombres.
//
// Le contrat de sortie du mapper est IDENTIQUE à FL ; seule la lecture diffère.

// deno-lint-ignore no-explicit-any
export type FicheLiteRow = Record<string, any>
// deno-lint-ignore no-explicit-any
export type Section = Record<string, any>

/**
 * Récupère une section JSONB de la fiche par son nom de colonne
 * (ex. `section('section_logement')`). Renvoie toujours un objet : une section
 * absente, nulle ou non-objet (array, scalaire) devient `{}` pour que les
 * accesseurs ci-dessous restent sûrs sans garde répétée.
 */
export function section(f: FicheLiteRow, col: string): Section {
  const v = f?.[col]
  return v != null && typeof v === 'object' && !Array.isArray(v) ? v : {}
}

/** Texte non vide, sinon null (trim). */
export function txt(s: Section, key: string): string | null {
  const v = s?.[key]
  if (v == null) return null
  const str = String(v).trim()
  return str === '' ? null : str
}

/** Booléen 3 états : true / false / null. */
export function bool(s: Section, key: string): boolean | null {
  const v = s?.[key]
  return v === true ? true : v === false ? false : null
}

/**
 * Booléen tolérant : gère les booléens natifs ET les chaînes radio "oui"/"non".
 * Superset sûr de `bool` (true→true, false→false, null→null). Dans `fiche_lite`
 * les booléens sont natifs, mais on garde la tolérance pour les champs radio.
 */
export function boolish(s: Section, key: string): boolean | null {
  const v = s?.[key]
  if (v === true) return true
  if (v === false) return false
  if (typeof v === 'string') {
    const str = v.trim().toLowerCase()
    if (str === 'oui' || str === 'true') return true
    if (str === 'non' || str === 'false') return false
  }
  return null
}

/** Présence stricte : true uniquement si la clé vaut exactement `true`. */
export function isTrue(s: Section, key: string): boolean {
  return s?.[key] === true
}

/** Array de chaînes non vides (les champs array du JSONB). */
export function arr(s: Section, key: string): string[] {
  const v = s?.[key]
  if (!Array.isArray(v)) return []
  return v.filter((x) => x != null && String(x).trim() !== '').map((x) => String(x))
}

/** Nombre fini, sinon null (champ int ou texte numérique — Lite stocke souvent en texte). */
export function num(s: Section, key: string): number | null {
  const v = s?.[key]
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/**
 * Suffixes des clés `${prefix}*` valant exactement true (cases cochées plates au
 * sein d'une section). Ex. scanTrueKeys(cuisine1, 'cafetiere_type_') →
 * ['filtre','nespresso',…]. Les clés texte voisines (valeur ≠ true) sont écartées.
 */
export function scanTrueKeys(s: Section, prefix: string): string[] {
  const out: string[] = []
  for (const k of Object.keys(s || {})) {
    if (k.startsWith(prefix) && s[k] === true) out.push(k.slice(prefix.length))
  }
  return out
}

/**
 * Clés d'un objet-de-booléens valant exactement true. Spécifique Lite : `atouts_logement`
 * et `types_voyageurs` sont stockés comme un OBJET `{ cle: true }` (pas des colonnes
 * plates comme FL). Renvoie les clés cochées, dans l'ordre d'insertion.
 */
export function trueKeys(obj: unknown): string[] {
  if (obj == null || typeof obj !== 'object' || Array.isArray(obj)) return []
  const o = obj as Record<string, unknown>
  return Object.keys(o).filter((k) => o[k] === true)
}
