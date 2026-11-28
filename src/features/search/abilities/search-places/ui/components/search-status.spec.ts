import { describe, expect, it } from 'vitest';
import type { Place } from '../../../../domain/place';
import type { SearchState } from '../../domain/search-places';
import type { Combobox } from './combobox.presenter';
import { statusOf } from './search-status';

const LOUVRE: Place = {
  id: 'louvre',
  name: 'Musée du Louvre',
  kind: 'museum',
  address: { street: 'Rue de Rivoli', postalCode: '75001', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: { longitude: 2.3376, latitude: 48.8606 },
  fame: 99
};

const open = (state: SearchState): Combobox => ({ text: 'louvre', open: true, active: -1, state });

describe('status of a search', () => {
  it('is silent while the suggestions are closed', () => {
    expect(statusOf({ ...open({ kind: 'searching', query: 'louvre' }), open: false })).toBe('');
  });

  it('is silent before the visitor types', () => {
    expect(statusOf(open({ kind: 'idle' }))).toBe('');
  });

  it('tells the visitor it is searching', () => {
    expect(statusOf(open({ kind: 'searching', query: 'louvre' }))).toBe('Searching…');
  });

  it('tells the visitor a single result is found', () => {
    expect(statusOf(open({ kind: 'found', query: 'louvre', places: [LOUVRE] }))).toBe('1 result found.');
  });

  it('counts the results found', () => {
    expect(statusOf(open({ kind: 'found', query: 'louvre', places: [LOUVRE, { ...LOUVRE, id: 'louvre-lens' }] }))).toBe(
      '2 results found.'
    );
  });

  it('tells the visitor nothing matches the text typed', () => {
    expect(statusOf(open({ kind: 'not-found', query: 'louvre' }))).toBe('No result for “louvre”.');
  });

  it('tells the visitor the search is unavailable', () => {
    expect(statusOf(open({ kind: 'unavailable' }))).toBe('Search is not available right now. Try again later.');
  });
});
