/**
 * aiCache.js
 * In-memory LRU cache for Atomesus AI match results.
 *
 * Avoids redundant API calls when the same lost+found description pair
 * is assessed more than once during a session (e.g. volunteer refreshes).
 *
 * Cache is keyed on the first 100 chars of each description pair.
 * Max size: 50 entries (oldest evicted first).
 */

const MAX_CACHE_SIZE = 50;

/** @type {Map<string, object>} */
const cache = new Map();

/**
 * Build a cache key from two descriptions.
 * @param {string} desc1
 * @param {string} desc2
 * @returns {string}
 */
function makeKey(desc1, desc2) {
  return `${(desc1 || '').slice(0, 100)}||${(desc2 || '').slice(0, 100)}`;
}

/**
 * Retrieve a cached AI result.
 * @param {string} lostDesc
 * @param {string} foundDesc
 * @returns {object|null} Cached result, or null on miss.
 */
export function getCached(lostDesc, foundDesc) {
  return cache.get(makeKey(lostDesc, foundDesc)) ?? null;
}

/**
 * Store an AI result in the cache.
 * Evicts the oldest entry if the cache is full.
 * @param {string} lostDesc
 * @param {string} foundDesc
 * @param {object} result
 */
export function setCached(lostDesc, foundDesc, result) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(makeKey(lostDesc, foundDesc), result);
}

/**
 * Clear all cached results (e.g. for testing).
 */
export function clearCache() {
  cache.clear();
}

/**
 * Return the number of cached entries.
 * @returns {number}
 */
export function cacheSize() {
  return cache.size;
}
