import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeText,
  validateFile,
  validateDescription,
  validateTitle,
  sanitizeFilename,
  MAX_DESCRIPTION_LENGTH,
  MAX_FILE_SIZE_MB,
} from '../src/utils/security.js';

describe('Security Utility Tests', () => {

  describe('sanitizeText()', () => {
    it('strips script tags from input', () => {
      const malicious = '<script>alert("xss")</script>Normal text';
      expect(sanitizeText(malicious)).toBe('Normal text');
    });

    it('strips HTML tags', () => {
      expect(sanitizeText('<b>bold</b> text')).toBe('bold text');
    });

    it('strips javascript: protocol', () => {
      expect(sanitizeText('javascript:alert(1)')).not.toContain('javascript:');
    });

    it('strips onerror event handlers', () => {
      expect(sanitizeText('img onerror=alert(1)')).not.toContain('onerror=');
    });

    it('trims whitespace', () => {
      expect(sanitizeText('  hello world  ')).toBe('hello world');
    });

    it('limits output to MAX_DESCRIPTION_LENGTH', () => {
      const long = 'a'.repeat(MAX_DESCRIPTION_LENGTH + 500);
      expect(sanitizeText(long).length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
    });

    it('returns empty string for null input', () => {
      expect(sanitizeText(null)).toBe('');
    });

    it('returns empty string for non-string input', () => {
      expect(sanitizeText(123)).toBe('');
    });
  });

  describe('validateFile()', () => {
    it('accepts null (no file) as valid', () => {
      const result = validateFile(null);
      expect(result.valid).toBe(true);
    });

    it('accepts JPEG images', () => {
      const file = new File([''], 'photo.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      expect(validateFile(file).valid).toBe(true);
    });

    it('accepts PNG images', () => {
      const file = new File([''], 'photo.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });
      expect(validateFile(file).valid).toBe(true);
    });

    it('rejects PDF files', () => {
      const file = new File([''], 'document.pdf', { type: 'application/pdf' });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('rejects text files', () => {
      const file = new File([''], 'data.txt', { type: 'text/plain' });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
    });

    it('rejects files over 5MB', () => {
      const file = new File([''], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: (MAX_FILE_SIZE_MB + 1) * 1024 * 1024 });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too large');
    });

    it('accepts files exactly at 5MB limit', () => {
      const file = new File([''], 'ok.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: MAX_FILE_SIZE_MB * 1024 * 1024 });
      expect(validateFile(file).valid).toBe(true);
    });
  });

  describe('validateDescription()', () => {
    it('rejects empty string', () => {
      const result = validateDescription('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('rejects whitespace-only string', () => {
      expect(validateDescription('   ').valid).toBe(false);
    });

    it('rejects strings over MAX_DESCRIPTION_LENGTH', () => {
      const long = 'a'.repeat(MAX_DESCRIPTION_LENGTH + 1);
      const result = validateDescription(long);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('characters or less');
    });

    it('accepts valid description', () => {
      expect(validateDescription('Black Nike backpack with red keychain').valid).toBe(true);
    });
  });

  describe('validateTitle()', () => {
    it('rejects empty title', () => {
      expect(validateTitle('').valid).toBe(false);
    });

    it('rejects title shorter than 3 chars', () => {
      expect(validateTitle('AB').valid).toBe(false);
    });

    it('accepts valid title', () => {
      expect(validateTitle('Black Nike Backpack').valid).toBe(true);
    });
  });

  describe('sanitizeFilename()', () => {
    it('removes path traversal sequences', () => {
      expect(sanitizeFilename('../../../etc/passwd')).not.toContain('..');
    });

    it('replaces special characters with underscore', () => {
      const result = sanitizeFilename('my file name (1).jpg');
      expect(result).not.toContain(' ');
      expect(result).not.toContain('(');
    });

    it('limits filename length to 100 chars', () => {
      const long = 'a'.repeat(200) + '.jpg';
      expect(sanitizeFilename(long).length).toBeLessThanOrEqual(100);
    });
  });

});
