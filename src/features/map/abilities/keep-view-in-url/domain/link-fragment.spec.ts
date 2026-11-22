import { describe, expect, it } from 'vitest';
import { linkOfFragment, linkTo } from './link-fragment';

describe('link of a fragment', () => {
  it('opens the place it names, at the centre of its view', () => {
    expect(linkOfFragment('map=17/48.85/2.29&place=flore')).toEqual({
      kind: 'place',
      id: 'flore',
      at: { longitude: 2.29, latitude: 48.85 }
    });
  });

  it('opens the place it names without a position when it has no view', () => {
    expect(linkOfFragment('place=flore')).toEqual({ kind: 'place', id: 'flore' });
  });

  it('reads an identifier written with escaped characters', () => {
    expect(linkOfFragment('place=a%2Fb')).toEqual({ kind: 'place', id: 'a/b' });
  });

  it('opens nothing for an empty identifier', () => {
    expect(linkOfFragment('map=17/48.85/2.29&place=')).toBeUndefined();
  });

  it('opens the spot at the centre of its view', () => {
    expect(linkOfFragment('map=17/48.85/2.29&point=1')).toEqual({
      kind: 'point',
      at: { longitude: 2.29, latitude: 48.85 }
    });
  });

  it('opens no spot without a view', () => {
    expect(linkOfFragment('point=1')).toBeUndefined();
  });

  it('opens no spot for another mark than 1', () => {
    expect(linkOfFragment('map=17/48.85/2.29&point=yes')).toBeUndefined();
  });

  it('opens nothing for a view alone', () => {
    expect(linkOfFragment('map=17/48.85/2.29')).toBeUndefined();
  });
});

describe('link to share', () => {
  it('names the place at zoom 17 on its position, with the decimals of that zoom', () => {
    expect(
      linkTo('https://example.org/fr#map=12/48/2', {
        at: { longitude: 2.222_222_6, latitude: 48.111_111_4 },
        place: 'flore'
      })
    ).toBe('https://example.org/fr#map=17/48.111111/2.222223&place=flore');
  });

  it('marks a spot', () => {
    expect(linkTo('https://example.org/fr', { at: { longitude: 2.29, latitude: 48.85 } })).toBe(
      'https://example.org/fr#map=17/48.85/2.29&point=1'
    );
  });

  it('escapes the identifier of the place', () => {
    expect(linkTo('https://example.org/', { at: { longitude: 2, latitude: 48 }, place: 'a/b' })).toBe(
      'https://example.org/#map=17/48/2&place=a%2Fb'
    );
  });

  it('keeps the address of the page before its hash', () => {
    expect(linkTo('https://example.org/untracked/en?q=1#map=3/1/1', { at: { longitude: 2, latitude: 48 } })).toBe(
      'https://example.org/untracked/en?q=1#map=17/48/2&point=1'
    );
  });
});
