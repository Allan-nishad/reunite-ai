/**
 * classifier.js
 * Single source of truth for the REUNITE AI 3-category classifier.
 * Imported by App.jsx, Console.jsx, atomesus.js, and all test files.
 *
 * Categories:
 *   'person'   — lost children, separated groups, found individuals
 *   'bag'      — backpacks, jackets, suitcases, general bags
 *   'document' — passports, wallets, ID cards, certificates
 *
 * Hard category walls prevent cross-category false matches (a wallet can
 * never match a Lost Child report). This mirrors the production vector
 * embedding bucket strategy.
 */

const PERSON_RE = /\b(boy|girl|man|woman|child|person|human|teenager|kid|maya|son|daughter|guy|lady|fan|people|group)\b/;
const BAG_RE    = /\b(backpack|bag|pack|rucksack|suitcase|briefcase|jacket|coat|puffer)\b/;
const DOC_RE    = /\b(passport|wallet|document|id card|pass|licence|license|certificate)\b/;

/**
 * Classify a piece of text into one of three incident categories.
 *
 * @param {string} text - The combined title + description to classify.
 * @param {string} [incType] - Optional incident type for type-based fallback
 *   (e.g. 'Lost Child' always resolves to 'person' even with no keywords).
 * @returns {'person' | 'bag' | 'document' | null}
 */
export function getCategory(text, incType) {
  // Type-based override — Lost Child / Separated Group are always 'person'
  if (incType === 'Lost Child' || incType === 'Separated Group') return 'person';

  if (!text) return null;
  const t = text.toLowerCase();

  if (PERSON_RE.test(t)) return 'person';
  if (BAG_RE.test(t))    return 'bag';
  if (DOC_RE.test(t))    return 'document';

  return null;
}

/**
 * Build category-based lookup indexes from an array of items.
 * Reduces O(n) linear scans to O(1) index lookups per category.
 *
 * @param {Array<object>} items - Array of incidents or found items.
 * @returns {{ person: object[], bag: object[], document: object[] }}
 */
export function buildCategoryIndex(items) {
  const indexes = { person: [], bag: [], document: [] };
  if (!Array.isArray(items)) return indexes;

  items.forEach(item => {
    const text = ((item.title || '') + ' ' + (item.description || '')).toLowerCase();
    const category = getCategory(text, item.type);
    if (category && indexes[category]) {
      indexes[category].push(item);
    }
  });

  return indexes;
}
