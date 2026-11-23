import { base, fr } from '@faker-js/faker';
import { describe, expect, it } from 'vitest';
import type { FakeZone } from './fake-zone';
import { generatedPlaces } from './generated-places';

const LYON: FakeZone = {
  bounds: { west: 4.79, south: 45.71, east: 4.9, north: 45.8 },
  city: 'Lyon',
  country: 'FR',
  districts: [],
  id: 'fake-lyon',
  landmarks: [],
  locale: [fr, base],
  postcodes: ['69001', '69002', '69003']
};

const PLACES = generatedPlaces(LYON, 600);

const FICTION_PHONE = /^\+33 1 99 00 \d{2} \d{2}$/u;

const EXAMPLE_SITE = /^https:\/\/(?:www\.)?[a-z0-9]+(?:-[a-z0-9]+)*\.example$/u;

const EXAMPLE_MENU = /^https:\/\/(?:www\.)?[a-z0-9]+(?:-[a-z0-9]+)*\.example\/menu$/u;

const EXAMPLE_INSTAGRAM = /^https:\/\/instagram\.example\/[a-z0-9]+$/u;

const EXAMPLE_FACEBOOK = /^https:\/\/facebook\.example\/[A-Za-z0-9]+$/u;

const EATING = new Set(['restaurant', 'cafe', 'bar']);

const shareWith = (key: 'phone' | 'website' | 'menu' | 'instagram' | 'facebook'): number =>
  PLACES.filter((place) => place[key] !== undefined).length / PLACES.length;

const valuesOf = (key: 'phone' | 'website' | 'menu' | 'instagram' | 'facebook'): readonly string[] =>
  PLACES.flatMap((place) => place[key] ?? []);

describe('the phones of generated places', () => {
  it('are given to more than half of them', () => {
    expect(shareWith('phone')).toBeGreaterThan(0.5);
  });

  it('leave some of them without one', () => {
    expect(shareWith('phone')).toBeLessThan(0.7);
  });

  it('are in the Paris range kept for fiction, written as the former app wrote them', () => {
    expect(valuesOf('phone').filter((phone) => !FICTION_PHONE.test(phone))).toEqual([]);
  });
});

describe('the websites of generated places', () => {
  it('are given to about a third of them', () => {
    expect(shareWith('website')).toBeGreaterThan(0.25);
  });

  it('are on example addresses', () => {
    expect(valuesOf('website').filter((website) => !EXAMPLE_SITE.test(website))).toEqual([]);
  });

  it('sometimes start with www', () => {
    expect(valuesOf('website').some((website) => website.startsWith('https://www.'))).toBe(true);
  });
});

describe('the menus of generated places', () => {
  it('are given to places where one eats or drinks only', () => {
    expect(PLACES.filter(({ kind, menu }) => menu !== undefined && !EATING.has(kind))).toEqual([]);
  });

  it('are given to some of them', () => {
    expect(shareWith('menu')).toBeGreaterThan(0.05);
  });

  it('are on example addresses', () => {
    expect(valuesOf('menu').filter((menu) => !EXAMPLE_MENU.test(menu))).toEqual([]);
  });
});

describe('the ways to reach a generated place', () => {
  it('write its website after its name, without accents', () => {
    expect(PLACES.find(({ id }) => id === 'fake-lyon-0031')?.website).toBe('https://hotel-moreau.example');
  });

  it('write its Instagram account after its name, without accents', () => {
    expect(PLACES.find(({ id }) => id === 'fake-lyon-0031')?.instagram).toBe('https://instagram.example/hotelmoreau');
  });

  it('leave out what the place does not have', () => {
    expect(PLACES.filter((place) => Object.values(place).some((value) => value === undefined))).toEqual([]);
  });
});

describe('the social accounts of generated places', () => {
  it('give Instagram to some of them', () => {
    expect(shareWith('instagram')).toBeGreaterThan(0.1);
  });

  it('give Facebook to some of them', () => {
    expect(shareWith('facebook')).toBeGreaterThan(0.08);
  });

  it('are on an example Instagram', () => {
    expect(valuesOf('instagram').filter((instagram) => !EXAMPLE_INSTAGRAM.test(instagram))).toEqual([]);
  });

  it('are on an example Facebook', () => {
    expect(valuesOf('facebook').filter((facebook) => !EXAMPLE_FACEBOOK.test(facebook))).toEqual([]);
  });
});
