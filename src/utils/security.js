/**
 * security.js
 * Input validation and file security utilities for REUNITE AI.
 *
 * Security principles:
 *  - All user text is sanitized before processing (strip HTML/script tags)
 *  - Image uploads are restricted by MIME type and file size
 *  - No PII is persisted — all state is in-memory only
 *  - In production, all data would be encrypted at rest and in transit
 */

export const MAX_DESCRIPTION_LENGTH = 1000;
export const MAX_TITLE_LENGTH       = 120;
export const MIN_TITLE_LENGTH       = 3;
export const MAX_FILE_SIZE_MB       = 5;
export const ALLOWED_IMAGE_TYPES    = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

/**
 * Strip HTML tags, script injection patterns, and trim whitespace.
 * Limits output to MAX_DESCRIPTION_LENGTH characters.
 *
 * @param {string} input
 * @returns {string}
 */
export function sanitizeText(input) {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, MAX_DESCRIPTION_LENGTH);
}

/**
 * Validate an image File object for type and size.
 *
 * @param {File|null} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFile(file) {
  if (!file) return { valid: true };

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return {
      valid: false,
      error: `Invalid file type "${file.type}". Only JPEG, PNG, WebP, and GIF images are allowed.`,
    };
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_FILE_SIZE_MB) {
    return {
      valid: false,
      error: `File is too large (${sizeMB.toFixed(1)} MB). Maximum size is ${MAX_FILE_SIZE_MB} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Validate an incident description string.
 *
 * @param {string} text
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateDescription(text) {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Description is required.' };
  }
  if (text.trim().length > MAX_DESCRIPTION_LENGTH) {
    return {
      valid: false,
      error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less (currently ${text.length}).`,
    };
  }
  return { valid: true };
}

/**
 * Validate an incident title string.
 *
 * @param {string} text
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateTitle(text) {
  if (!text || text.trim().length < MIN_TITLE_LENGTH) {
    return { valid: false, error: `Title must be at least ${MIN_TITLE_LENGTH} characters.` };
  }
  if (text.trim().length > MAX_TITLE_LENGTH) {
    return { valid: false, error: `Title must be ${MAX_TITLE_LENGTH} characters or less.` };
  }
  return { valid: true };
}

/**
 * Sanitize an uploaded filename to prevent path traversal.
 *
 * @param {string} name
 * @returns {string}
 */
export function sanitizeFilename(name) {
  if (!name || typeof name !== 'string') return 'upload';
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '_')
    .slice(0, 100);
}
