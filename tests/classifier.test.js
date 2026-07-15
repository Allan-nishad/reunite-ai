import { describe, it, expect } from 'vitest';

// Simple category detection logic extracted from App.jsx & Console.jsx for validation
const getCategory = (text, incType) => {
  const t = text.toLowerCase();
  if (/\b(boy|girl|man|woman|child|person|human|teenager|kid|maya|son|daughter|guy|lady|fan|people|group)\b/.test(t)) return 'person';
  if (/\b(backpack|bag|pack|rucksack|suitcase|briefcase|jacket|coat|puffer)\b/.test(t)) return 'bag';
  if (/\b(passport|wallet|document|id card|pass|licence|license|certificate)\b/.test(t)) return 'document';
  if (incType === 'Lost Child' || incType === 'Separated Group') return 'person';
  return null;
};

describe('3-Category Classifier Tests', () => {
  it('correctly identifies person keyword variations', () => {
    expect(getCategory('A young boy separated from group')).toBe('person');
    expect(getCategory('Maya lost child description')).toBe('person');
    expect(getCategory('steward found a human near gate A')).toBe('person');
  });

  it('correctly identifies bag keyword variations', () => {
    expect(getCategory('Black Nike backpack near concession')).toBe('bag');
    expect(getCategory('Blue Adidas puffer jacket')).toBe('bag');
  });

  it('correctly identifies document keyword variations', () => {
    expect(getCategory('German passport in blue folder')).toBe('document');
    expect(getCategory('leather wallet with ID cards')).toBe('document');
  });

  it('handles custom types like Lost Child as person', () => {
    expect(getCategory('No matchable keywords here', 'Lost Child')).toBe('person');
  });

  it('returns null for unrelated text with no categories matching', () => {
    expect(getCategory('unrelated item description')).toBeNull();
  });
});
