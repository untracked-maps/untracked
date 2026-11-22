import { describe, expect, it } from 'vitest';
import type { Coordinates, Place } from '../../../domain/place';
import { rankedOf, strongFirst } from './ranking';

type Ranked = ReturnType<ReturnType<typeof rankedOf>>;

const HERE: Coordinates = { longitude: 2.35, latitude: 48.85 };

const KILOMETRES_PER_DEGREE_OF_LATITUDE = 110.54;

const kilometresNorth = (kilometres: number): Coordinates => ({
  longitude: HERE.longitude,
  latitude: HERE.latitude + kilometres / KILOMETRES_PER_DEGREE_OF_LATITUDE
});

const kilometresEast = (kilometres: number): Coordinates => ({
  longitude: HERE.longitude + kilometres / (111.32 * Math.cos((HERE.latitude * Math.PI) / 180)),
  latitude: HERE.latitude
});

const place = (changes: Partial<Place>): Place => ({
  id: 'alpha-beta',
  name: 'Alpha Beta',
  kind: 'hotel',
  address: { postalCode: '75001', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: HERE,
  fame: 0,
  ...changes
});

const ranked = (query: string, qualities: readonly number[], changes: Partial<Place> = {}): Ranked =>
  rankedOf(query, HERE)({ place: place(changes), qualities });

const scoreOf = (query: string, qualities: readonly number[], changes: Partial<Place> = {}): number =>
  ranked(query, qualities, changes).score;

describe('score of a place', () => {
  it('weighs the quality of the text by the share of the name it covers', () => {
    expect(scoreOf('gamma', [1])).toBeCloseTo(80);
  });

  it('averages the quality of the words typed', () => {
    expect(scoreOf('gamma', [1, 0.5])).toBeCloseTo(75);
  });

  it('adds a bonus when the query is the whole name', () => {
    expect(scoreOf('alpha beta', [1, 1])).toBeCloseTo(115);
  });

  it('adds a smaller bonus when the name starts with the query', () => {
    expect(scoreOf('alpha', [1])).toBeCloseTo(88);
  });
});

describe('score of a place of some fame and kind', () => {
  it('adds the fame of the place', () => {
    expect(scoreOf('gamma', [1, 1], { fame: 50 })).toBeCloseTo(130);
  });

  it('adds a bonus for a station', () => {
    expect(scoreOf('gamma', [1, 1], { kind: 'station' })).toBeCloseTo(110);
  });

  it('takes points off a car park', () => {
    expect(scoreOf('gamma', [1, 1], { kind: 'parking' })).toBeCloseTo(88);
  });
});

describe('score of a place away from the reference', () => {
  it('takes three points off per kilometre nearby', () => {
    expect(scoreOf('gamma', [1, 1], { coordinates: kilometresNorth(2) })).toBeCloseTo(100 - 6 - 0.08);
  });

  it('counts the kilometres eastwards at the latitude of the reference', () => {
    expect(scoreOf('gamma', [1, 1], { coordinates: kilometresEast(2) })).toBeCloseTo(100 - 6 - 0.08);
  });

  it('caps the nearby penalty and keeps telling far places apart', () => {
    expect(scoreOf('gamma', [1, 1], { coordinates: kilometresNorth(100) })).toBeCloseTo(100 - 25 - 4);
  });

  it('caps the whole distance penalty', () => {
    expect(scoreOf('gamma', [1, 1], { coordinates: kilometresNorth(1000) })).toBeCloseTo(100 - 25 - 20);
  });

  it('lets the fame of a landmark excuse part of its distance', () => {
    expect(scoreOf('gamma', [1, 1], { kind: 'museum', fame: 35, coordinates: kilometresNorth(2) })).toBeCloseTo(
      100 + 21 + 8 - 3.04
    );
  });

  it('lets a very famous landmark be as far as it is', () => {
    expect(scoreOf('gamma', [1, 1], { kind: 'museum', fame: 99, coordinates: kilometresNorth(2) })).toBeCloseTo(100 + 59.4 + 8);
  });

  it('never lets fame excuse the distance of a shop', () => {
    expect(scoreOf('gamma', [1, 1], { kind: 'pharmacy', fame: 70, coordinates: kilometresNorth(2) })).toBeCloseTo(
      100 + 42 - 6.08
    );
  });
});

describe('strength of a match', () => {
  it('is strong when the text is clear and covers half the name', () => {
    expect(ranked('gamma', [0.7]).strong).toBe(true);
  });

  it('is weak when the text is unclear', () => {
    expect(ranked('gamma', [0.69, 0.69]).strong).toBe(false);
  });

  it('is weak when the text covers less than half the name', () => {
    expect(ranked('gamma', [1], { name: 'Alpha Beta Gamma' }).strong).toBe(false);
  });
});

describe('order of places', () => {
  const strong: Ranked = { place: place({ id: 'strong' }), score: 10, strong: true };
  const weak: Ranked = { place: place({ id: 'weak' }), score: 90, strong: false };
  const higher: Ranked = { place: place({ id: 'higher' }), score: 20, strong: true };

  it('puts strong matches first', () => {
    expect([weak, strong].toSorted(strongFirst).map(({ place: { id } }) => id)).toEqual(['strong', 'weak']);
  });

  it('puts higher scores first among matches of the same strength', () => {
    expect([strong, higher].toSorted(strongFirst).map(({ place: { id } }) => id)).toEqual(['higher', 'strong']);
  });
});
