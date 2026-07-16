import { describe, it, expect } from 'vitest';
import { translateInput, getLangLabel, getLangFlag } from '../src/utils/translator.js';

describe('Multilingual Translation Tests', () => {

  describe('Spanish (ES) → English', () => {
    it('translates "mochila negra" to "black backpack"', () => {
      const result = translateInput('mochila negra encontrada cerca de Gate B');
      expect(result.text).toContain('black backpack');
      expect(result.lang).toBe('es');
    });

    it('translates full phrase "perdí mi mochila negra"', () => {
      const result = translateInput('perdí mi mochila negra');
      expect(result.text).toContain('lost my black backpack');
      expect(result.lang).toBe('es');
    });

    it('translates "pasaporte alemán"', () => {
      const result = translateInput('pasaporte alemán en el salón VIP');
      expect(result.text).toContain('german passport');
      expect(result.lang).toBe('es');
    });

    it('translates "niño perdido"', () => {
      const result = translateInput('niño perdido cerca de Gate A');
      expect(result.text).toContain('lost child');
      expect(result.lang).toBe('es');
    });

    it('translates "chaqueta azul"', () => {
      const result = translateInput('chaqueta azul perdida');
      expect(result.text).toContain('blue jacket');
      expect(result.lang).toBe('es');
    });
  });

  describe('French (FR) → English', () => {
    it('translates "sac à dos noir"', () => {
      const result = translateInput('sac à dos noir trouvé près de la porte');
      expect(result.text).toContain('black backpack');
      expect(result.lang).toBe('fr');
    });

    it('translates "passeport allemand"', () => {
      const result = translateInput('passeport allemand au bureau VIP');
      expect(result.text).toContain('german passport');
      expect(result.lang).toBe('fr');
    });

    it('translates "enfant perdu"', () => {
      const result = translateInput('enfant perdu près de la porte A');
      expect(result.text).toContain('lost child');
      expect(result.lang).toBe('fr');
    });

    it('translates "veste bleue"', () => {
      const result = translateInput('veste bleue dans la tribune nord');
      expect(result.text).toContain('blue jacket');
      expect(result.lang).toBe('fr');
    });
  });

  describe('English passthrough', () => {
    it('returns English text unchanged', () => {
      const result = translateInput('black nike backpack with laptop inside');
      expect(result.lang).toBe('en');
      expect(result.text).toBe('black nike backpack with laptop inside');
    });

    it('preserves original text reference', () => {
      const original = 'German passport in VIP lounge';
      const result = translateInput(original);
      expect(result.original).toBe(original);
    });
  });

  describe('Edge cases', () => {
    it('handles empty string gracefully', () => {
      const result = translateInput('');
      expect(result.text).toBe('');
      expect(result.lang).toBe('en');
    });

    it('handles null gracefully', () => {
      const result = translateInput(null);
      expect(result.text).toBe('');
      expect(result.lang).toBe('en');
    });

    it('handles undefined gracefully', () => {
      const result = translateInput(undefined);
      expect(result.text).toBe('');
      expect(result.lang).toBe('en');
    });
  });

  describe('Helper functions', () => {
    it('getLangLabel returns correct language name', () => {
      expect(getLangLabel('es')).toBe('Spanish');
      expect(getLangLabel('fr')).toBe('French');
      expect(getLangLabel('en')).toBe('English');
    });

    it('getLangFlag returns flag emoji', () => {
      expect(getLangFlag('es')).toBe('🇪🇸');
      expect(getLangFlag('fr')).toBe('🇫🇷');
      expect(getLangFlag('en')).toBe('🇬🇧');
    });
  });

});
