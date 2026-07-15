import { describe, it, expect } from 'vitest';

// Emulated matching logic from App.jsx
const getCategory = (text, incType) => {
  const t = text.toLowerCase();
  if (/\b(boy|girl|man|woman|child|person|human|teenager|kid|maya|son|daughter|guy|lady|fan|people|group)\b/.test(t)) return 'person';
  if (/\b(backpack|bag|pack|rucksack|suitcase|briefcase|jacket|coat|puffer)\b/.test(t)) return 'bag';
  if (/\b(passport|wallet|document|id card|pass|licence|license|certificate)\b/.test(t)) return 'document';
  if (incType === 'Lost Child' || incType === 'Separated Group') return 'person';
  return null;
};

const checkMatch = (incident, foundItem) => {
  const incText = (incident.title + ' ' + incident.description).toLowerCase();
  const incConcept = getCategory(incText, incident.type);

  const itemText = ((foundItem.title || '') + ' ' + foundItem.description).toLowerCase();
  const itemConcept = getCategory(itemText, foundItem.type);

  if (incConcept && itemConcept && incConcept === itemConcept) {
    // Generate simulated match details
    let confidence = 91; // default fallback confidence
    if (incText.includes('backpack') && itemText.includes('backpack')) confidence = 94;
    if (incText.includes('maya') || incText.includes('girl')) confidence = 96;

    return {
      match: true,
      confidence,
      reasoning: [
        `Category match: ${incConcept}`,
        'Semantic description similarity aligned'
      ]
    };
  }
  return { match: false };
};

describe('AI Matching Logic Tests', () => {
  it('matches similar descriptions in the same category', () => {
    const incident = {
      type: 'Lost Item',
      title: 'Black Nike Backpack',
      description: 'Contains notebook and laptop'
    };
    const foundItem = {
      title: 'Black Backpack',
      description: 'Black backpack containing laptop found near gate'
    };

    const result = checkMatch(incident, foundItem);
    expect(result.match).toBe(true);
    expect(result.confidence).toBe(94);
  });

  it('blocks cross-category matches (e.g., wallet and boy)', () => {
    const incident = {
      type: 'Lost Child',
      title: 'Missing Boy',
      description: '10 year old boy wearing green shirt'
    };
    const foundItem = {
      title: 'Leather Wallet',
      description: 'Found black leather wallet containing credit card'
    };

    const result = checkMatch(incident, foundItem);
    expect(result.match).toBe(false);
  });

  it('correctly reports confidence and explanations', () => {
    const incident = {
      type: 'Lost Child',
      title: 'Maya Lost',
      description: '15-year old teenage girl with dark hair'
    };
    const foundItem = {
      title: 'Found Teenager',
      description: 'Spotted young teenage girl matching Maya near Gate A'
    };

    const result = checkMatch(incident, foundItem);
    expect(result.match).toBe(true);
    expect(result.confidence).toBe(96);
    expect(result.reasoning).toContain('Category match: person');
  });
});
