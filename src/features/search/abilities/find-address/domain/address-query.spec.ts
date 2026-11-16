import { describe, expect, it } from 'vitest';
import { addressQueryOf } from './address-query';
import STREET_WORDS from './street-words.json' with { type: 'json' };

describe('intent of a query', () => {
  it('is an address when the query holds a digit', () => {
    expect(addressQueryOf('12 rue de rivoli').intent).toBe('address');
  });

  it('is an address for a postcode alone', () => {
    expect(addressQueryOf('75011').intent).toBe('address');
  });

  it('is a street when a word names a kind of street', () => {
    expect(addressQueryOf('rue de rivoli').intent).toBe('street');
  });

  it('is a street for an abbreviated kind of street', () => {
    expect(addressQueryOf('bd voltaire').intent).toBe('street');
  });

  it('is a street whatever the place of the kind of street', () => {
    expect(addressQueryOf('rivoli rue').intent).toBe('street');
  });

  it('is none for the name of a place', () => {
    expect(addressQueryOf('tour eiffel').intent).toBe('none');
  });

  it('is none for a kind of street not typed in full', () => {
    expect(addressQueryOf('ru de rivoli').intent).toBe('none');
  });
});

describe('house number of a query', () => {
  it('is the number the query starts with', () => {
    expect(addressQueryOf('12 rue de rivoli').number).toBe('12');
  });

  it('may have four digits', () => {
    expect(addressQueryOf('1234 rue de rivoli').number).toBe('1234');
  });

  it('is none past four digits', () => {
    expect(addressQueryOf('12345 rue de rivoli').number).toBeUndefined();
  });

  it('keeps "bis" typed apart', () => {
    expect(addressQueryOf('18 bis rue de chateaudun').number).toBe('18bis');
  });

  it('keeps "ter" typed apart', () => {
    expect(addressQueryOf('3 ter rue ordener').number).toBe('3ter');
  });

  it('keeps "bis" typed with it', () => {
    expect(addressQueryOf('18bis rue de chateaudun').number).toBe('18bis');
  });
});

describe('house number missing from a query', () => {
  it('is none when the query does not start with it', () => {
    expect(addressQueryOf('place du 11 novembre 1918').number).toBeUndefined();
  });

  it('is none when it is the start of a word', () => {
    expect(addressQueryOf('12e arrondissement').number).toBeUndefined();
  });

  it('is none for a word that only starts with digits', () => {
    expect(addressQueryOf('a12 rue de rivoli').number).toBeUndefined();
  });

  it('is none for "bis" alone', () => {
    expect(addressQueryOf('bis rue de chateaudun').number).toBeUndefined();
  });

  it('keeps "ter" typed with it', () => {
    expect(addressQueryOf('3ter rue ordener').number).toBe('3ter');
  });

  it('is none for an empty query', () => {
    expect(addressQueryOf('').number).toBeUndefined();
  });
});

describe('postcode of a query', () => {
  it('is a word of five digits', () => {
    expect(addressQueryOf('rue de rivoli 75001').postcode).toBe('75001');
  });

  it('is none without a word of five digits', () => {
    expect(addressQueryOf('rue de rivoli 7500').postcode).toBeUndefined();
  });

  it('is none for six digits', () => {
    expect(addressQueryOf('rue de rivoli 750011').postcode).toBeUndefined();
  });

  it('is none within a longer word', () => {
    expect(addressQueryOf('rue de rivoli x75001').postcode).toBeUndefined();
  });
});

describe('street words of a query', () => {
  it('leave out the number', () => {
    expect(addressQueryOf('12 rue de rivoli').words).toEqual(['rue', 'rivoli']);
  });

  it('leave out "bis" with the number', () => {
    expect(addressQueryOf('18 bis rue de chateaudun').words).toEqual(['rue', 'chateaudun']);
  });

  it('leave out the postcode', () => {
    expect(addressQueryOf('rue de rivoli 75001').words).toEqual(['rue', 'rivoli']);
  });

  it('keep the digits that do not start the query', () => {
    expect(addressQueryOf('place du 11 novembre 1918').words).toEqual(['place', '11', 'novembre', '1918']);
  });

  it('spell out abbreviations', () => {
    expect(addressQueryOf('12 av st ouen').words).toEqual(['avenue', 'saint', 'ouen']);
  });

  it('fold accents and capitals', () => {
    expect(addressQueryOf('Allée Élysée').words).toEqual(['allee', 'elysee']);
  });

  it('leave out the city', () => {
    expect(addressQueryOf('rue de rivoli paris').words).toEqual(['rue', 'rivoli']);
  });
});

describe('words of streets', () => {
  it('spell out every abbreviation', () => {
    expect(Object.keys(STREET_WORDS.abbreviations).filter((short) => addressQueryOf(short).words[0] === short)).toEqual([]);
  });

  it('name a street with every kind of street', () => {
    expect(STREET_WORDS.kinds.filter((kind) => addressQueryOf(kind).intent !== 'street')).toEqual([]);
  });

  it('spell out every abbreviation of a kind of street as a kind of street', () => {
    expect(addressQueryOf('qu de seine').intent).toBe('street');
  });
});
