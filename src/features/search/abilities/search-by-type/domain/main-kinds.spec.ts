import { describe, expect, it } from 'vitest';
import { MAIN_KINDS } from './main-kinds';

describe('main kinds', () => {
  it('are restaurants, cafés, bakeries, pharmacies, supermarkets, bars and museums, in that order', () => {
    expect(MAIN_KINDS).toEqual(['restaurant', 'cafe', 'bakery', 'pharmacy', 'supermarket', 'bar', 'museum']);
  });
});
