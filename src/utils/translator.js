/**
 * translator.js
 * Multilingual normalization for REUNITE AI.
 *
 * Automatically translates Spanish (ES) and French (FR) incident descriptions
 * to English before the matching engine processes them. This ensures unified
 * matching across international fans at FIFA World Cup 2030.
 *
 * In production, this layer would call the Gemini Translation API.
 * For the hackathon prototype, we use a deterministic keyword-replacement map.
 */

/** @type {Array<{ from: RegExp, to: string }>} */
const ES_RULES = [
  { from: /\bperd[íi] mi mochila negra\b/g, to: 'lost my black backpack' },
  { from: /\bmochila negra\b/g,             to: 'black backpack' },
  { from: /\bpasaporte alem[aá]n\b/g,       to: 'german passport' },
  { from: /\bni[ñn]o perdido\b/g,           to: 'lost child' },
  { from: /\bchaqueta azul\b/g,             to: 'blue jacket' },
  { from: /\bni[ñn]o\b/g,                   to: 'child' },
  { from: /\bmochila\b/g,                   to: 'backpack' },
  { from: /\bpasaporte\b/g,                 to: 'passport' },
  { from: /\bnegra\b/g,                     to: 'black' },
  { from: /\bazul\b/g,                      to: 'blue' },
  { from: /\balem[aá]n\b/g,                 to: 'german' },
  { from: /\bsecci[oó]n\b/g,               to: 'section' },
  { from: /\bsal[oó]n\b/g,                 to: 'lounge' },
  { from: /\bperdido\b/g,                   to: 'lost' },
  { from: /\bperd[íi]\b/g,                  to: 'lost' },
];

/** @type {Array<{ from: RegExp, to: string }>} */
const FR_RULES = [
  { from: /\bsac à dos noir\b/g,            to: 'black backpack' },
  { from: /\bpasseport allemand\b/g,        to: 'german passport' },
  { from: /\benfant perdu\b/g,              to: 'lost child' },
  { from: /\bveste bleue\b/g,               to: 'blue jacket' },
  { from: /\bsac à dos\b/g,                 to: 'backpack' },
  { from: /\bpasseport\b/g,                 to: 'passport' },
  { from: /\benfant\b/g,                    to: 'child' },
  { from: /\bnoir\b/g,                      to: 'black' },
  { from: /\bbleu\b/g,                      to: 'blue' },
  { from: /\ballemand\b/g,                  to: 'german' },
  { from: /\btribune\b/g,                   to: 'stand' },
  { from: /\btrouvé\b/g,                    to: 'found' },
  { from: /\bperdu\b/g,                     to: 'lost' },
];

/**
 * Translate an ES or FR incident description to English.
 * Returns English text unchanged.
 *
 * @param {string} text - Raw input from fan or volunteer.
 * @returns {{ text: string, lang: 'en' | 'es' | 'fr', original: string }}
 */
export function translateInput(text) {
  if (!text || typeof text !== 'string') {
    return { text: '', lang: 'en', original: '' };
  }

  const lower = text.toLowerCase();
  let translated = lower;
  let detectedLang = 'en';

  // Try Spanish first
  for (const rule of ES_RULES) {
    if (rule.from.test(lower)) {
      translated = translated.replace(rule.from, rule.to);
      detectedLang = 'es';
    }
  }

  // Try French only if Spanish wasn't detected
  if (detectedLang === 'en') {
    for (const rule of FR_RULES) {
      if (rule.from.test(lower)) {
        translated = translated.replace(rule.from, rule.to);
        detectedLang = 'fr';
      }
    }
  }

  return { text: translated, lang: detectedLang, original: text };
}

/**
 * Get the human-readable language name for a detected lang code.
 * @param {'en'|'es'|'fr'} lang
 * @returns {string}
 */
export function getLangLabel(lang) {
  return { en: 'English', es: 'Spanish', fr: 'French' }[lang] ?? 'Unknown';
}

/**
 * Get the flag emoji for a detected lang code.
 * @param {'en'|'es'|'fr'} lang
 * @returns {string}
 */
export function getLangFlag(lang) {
  return { en: '🇬🇧', es: '🇪🇸', fr: '🇫🇷' }[lang] ?? '🌐';
}
