import { describe, it, expect, beforeEach } from 'vitest';
import { getCached, setCached, clearCache, cacheSize } from '../src/utils/aiCache.js';

describe('AI Cache Tests', () => {

  beforeEach(() => {
    clearCache();
  });

  it('returns null for a cold cache miss', () => {
    const result = getCached('lost backpack description', 'found backpack');
    expect(result).toBeNull();
  });

  it('stores and retrieves a cached result', () => {
    const mockResult = { match: true, confidence: 94, reasoning: ['Same brand'] };
    setCached('lost backpack description', 'found backpack', mockResult);
    const cached = getCached('lost backpack description', 'found backpack');
    expect(cached).toEqual(mockResult);
  });

  it('different keys return different values', () => {
    setCached('desc1', 'found1', { confidence: 94 });
    setCached('desc2', 'found2', { confidence: 70 });
    expect(getCached('desc1', 'found1').confidence).toBe(94);
    expect(getCached('desc2', 'found2').confidence).toBe(70);
  });

  it('returns null after cache is cleared', () => {
    setCached('some description', 'some found', { match: true });
    clearCache();
    expect(getCached('some description', 'some found')).toBeNull();
  });

  it('cacheSize() returns correct count', () => {
    expect(cacheSize()).toBe(0);
    setCached('desc1', 'found1', {});
    setCached('desc2', 'found2', {});
    expect(cacheSize()).toBe(2);
  });

  it('handles empty string keys gracefully', () => {
    setCached('', '', { match: false });
    expect(getCached('', '')).toEqual({ match: false });
  });

  it('handles null descriptions gracefully', () => {
    expect(() => getCached(null, null)).not.toThrow();
    expect(getCached(null, null)).toBeNull();
  });

});
