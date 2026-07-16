import { describe, it, expect } from 'vitest';
import { getCategory, buildCategoryIndex } from '../src/utils/classifier.js';

describe('3-Category Classifier Tests', () => {

  describe('Person detection', () => {
    it('correctly identifies person from boy keyword', () => {
      expect(getCategory('A young boy separated from group')).toBe('person');
    });

    it('correctly identifies person from proper name "Maya"', () => {
      expect(getCategory('Maya lost child description')).toBe('person');
    });

    it('correctly identifies person from "human" keyword', () => {
      expect(getCategory('steward found a human near gate A')).toBe('person');
    });

    it('correctly identifies person from "teenager" keyword', () => {
      expect(getCategory('15-year old teenager near concourse B')).toBe('person');
    });
  });

  describe('Bag detection', () => {
    it('correctly identifies bag from "backpack" keyword', () => {
      expect(getCategory('Black Nike backpack near concession')).toBe('bag');
    });

    it('correctly identifies bag from "jacket" keyword', () => {
      expect(getCategory('Blue Adidas puffer jacket')).toBe('bag');
    });

    it('correctly identifies bag from "rucksack" keyword', () => {
      expect(getCategory('Brown rucksack with zipper')).toBe('bag');
    });
  });

  describe('Document detection', () => {
    it('correctly identifies document from "passport" keyword', () => {
      expect(getCategory('German passport in blue folder')).toBe('document');
    });

    it('correctly identifies document from "wallet" keyword', () => {
      expect(getCategory('leather wallet with ID cards')).toBe('document');
    });

    it('correctly identifies document from "license" keyword', () => {
      expect(getCategory("Driver's license found near exit")).toBe('document');
    });
  });

  describe('Type override', () => {
    it('handles "Lost Child" type as person even with no keywords', () => {
      expect(getCategory('No matchable keywords here', 'Lost Child')).toBe('person');
    });

    it('handles "Separated Group" type as person', () => {
      expect(getCategory('Unknown items found nearby', 'Separated Group')).toBe('person');
    });
  });

  describe('Null / unknown', () => {
    it('returns null for unrelated text', () => {
      expect(getCategory('unrelated item description')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getCategory('')).toBeNull();
    });

    it('returns null for null input without type', () => {
      expect(getCategory(null)).toBeNull();
    });
  });

  describe('buildCategoryIndex()', () => {
    it('builds a correct index from an array of items', () => {
      const items = [
        { title: 'Black Backpack', description: 'Nike bag found', type: 'Lost Item' },
        { title: 'German Passport', description: 'Passport in wallet', type: 'Lost Item' },
        { title: 'Lost Child Maya', description: 'Teenager girl', type: 'Lost Child' },
      ];
      const index = buildCategoryIndex(items);
      expect(index.bag.length).toBe(1);
      expect(index.document.length).toBe(1);
      expect(index.person.length).toBe(1);
    });

    it('handles empty array', () => {
      const index = buildCategoryIndex([]);
      expect(index.bag).toHaveLength(0);
      expect(index.person).toHaveLength(0);
      expect(index.document).toHaveLength(0);
    });
  });

});
