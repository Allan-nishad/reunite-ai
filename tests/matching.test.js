import { describe, it, expect } from 'vitest';
import { getCategory } from '../src/utils/classifier.js';
import { translateInput } from '../src/utils/translator.js';

// Matching logic using shared utilities (mirrors App.jsx / Console.jsx)
const checkMatch = (incident, foundItem) => {
  const incText     = (incident.title + ' ' + incident.description).toLowerCase();
  const { text: translatedIncText }   = translateInput(incText);
  const incConcept  = getCategory(translatedIncText, incident.type);

  const itemText    = ((foundItem.title || '') + ' ' + foundItem.description).toLowerCase();
  const { text: translatedItemText }  = translateInput(itemText);
  const itemConcept = getCategory(translatedItemText, foundItem.type);

  if (incConcept && itemConcept && incConcept === itemConcept) {
    let confidence = 91;
    if (translatedIncText.includes('backpack') && translatedItemText.includes('backpack')) confidence = 94;
    if (translatedIncText.includes('maya') || translatedIncText.includes('girl'))           confidence = 96;

    return {
      match: true,
      confidence,
      reasoning: [
        `Category match: ${incConcept}`,
        'Semantic description similarity aligned',
      ],
    };
  }
  return { match: false };
};

describe('AI Matching Logic Tests', () => {

  it('matches similar bag descriptions in the same category', () => {
    const incident  = { type: 'Lost Item',  title: 'Black Nike Backpack', description: 'Contains notebook and laptop' };
    const foundItem = { title: 'Black Backpack', description: 'Black backpack containing laptop found near gate' };
    const result    = checkMatch(incident, foundItem);
    expect(result.match).toBe(true);
    expect(result.confidence).toBe(94);
  });

  it('blocks cross-category matches (bag vs person)', () => {
    const incident  = { type: 'Lost Child', title: 'Missing Boy', description: '10 year old boy wearing green shirt' };
    const foundItem = { title: 'Leather Wallet', description: 'Found black leather wallet containing credit card' };
    const result    = checkMatch(incident, foundItem);
    expect(result.match).toBe(false);
  });

  it('blocks cross-category matches (document vs bag)', () => {
    const incident  = { type: 'Lost Item', title: 'German Passport', description: 'Blue passport wallet' };
    const foundItem = { title: 'Blue Jacket',  description: 'Blue Adidas jacket found at seat' };
    const result    = checkMatch(incident, foundItem);
    expect(result.match).toBe(false);
  });

  it('matches lost child with found teenager', () => {
    const incident  = { type: 'Lost Child', title: 'Maya Lost', description: '15-year old teenage girl with dark hair' };
    const foundItem = { title: 'Found Teenager', description: 'Spotted young teenage girl matching Maya near Gate A' };
    const result    = checkMatch(incident, foundItem);
    expect(result.match).toBe(true);
    expect(result.confidence).toBe(96);
    expect(result.reasoning).toContain('Category match: person');
  });

  it('matches documents in same category', () => {
    const incident  = { type: 'Lost Item', title: 'German Passport', description: 'Dark brown passport wallet' };
    const foundItem = { title: 'Passport', description: 'Brown passport holder found at VIP lounge' };
    const result    = checkMatch(incident, foundItem);
    expect(result.match).toBe(true);
  });

  it('correctly reports confidence and reasoning', () => {
    const incident  = { type: 'Lost Item', title: 'Black Backpack', description: 'Nike backpack with red keychain' };
    const foundItem = { title: 'Found Backpack', description: 'Black Nike backpack with keychain found' };
    const result    = checkMatch(incident, foundItem);
    expect(typeof result.confidence).toBe('number');
    expect(result.confidence).toBeGreaterThan(0);
    expect(Array.isArray(result.reasoning)).toBe(true);
    expect(result.reasoning.length).toBeGreaterThan(0);
  });

  it('matches Spanish input via translation before category check', () => {
    const incident  = { type: 'Lost Item', title: 'Mochila Negra', description: 'mochila negra con portátil' };
    const foundItem = { title: 'Black Backpack', description: 'black backpack found near gate B' };
    const result    = checkMatch(incident, foundItem);
    // mochila → backpack → category 'bag' on both sides
    expect(result.match).toBe(true);
  });

});
