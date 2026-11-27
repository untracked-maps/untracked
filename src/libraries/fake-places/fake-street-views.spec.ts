import { describe, expect, it } from 'vitest';
import { PHOTO_FILES } from './fake-photos';
import type { FakePlace } from './fake-place';
import { type FakePicture, fakeStreetViews, streetViewByHand } from './fake-street-views';

const CENTRE = { longitude: 2.35, latitude: 48.86 };

const METRES_PER_DEGREE = 111_320;

const IMAGE_WITHOUT_FAMILY = /^street-views\/none-\d{2}\.svg$/u;

const SEATING: Record<string, string> = Object.fromEntries([['outdoor_seating', 'yes']]);

const placeOf = (id: string, kind: FakePlace['kind'], coordinates = CENTRE, tags?: Record<string, string>): FakePlace => ({
  id,
  name: id,
  kind,
  address: { street: 'Rue de Rivoli', postalCode: '75001', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates,
  fame: 0,
  ...(tags === undefined ? {} : { tags })
});

const many = (kind: FakePlace['kind'], coordinates = CENTRE): readonly FakePlace[] =>
  Array.from({ length: 300 }, (_, index) => placeOf(`${kind}-${index}`, kind, coordinates));

const viewedShare = (places: readonly FakePlace[]): number => fakeStreetViews([], places).pictures.length / places.length;

const metresBetween = (from: FakePlace['coordinates'], to: FakePlace['coordinates']): number =>
  Math.hypot(
    (to.longitude - from.longitude) * METRES_PER_DEGREE * Math.cos((from.latitude * Math.PI) / 180),
    (to.latitude - from.latitude) * METRES_PER_DEGREE
  );

const headingFrom = (from: FakePlace['coordinates'], to: FakePlace['coordinates']): number =>
  ((Math.atan2((to.longitude - from.longitude) * Math.cos((from.latitude * Math.PI) / 180), to.latitude - from.latitude) *
    180) /
    Math.PI +
    360) %
  360;

const PICTURES: readonly FakePicture[] = fakeStreetViews([], many('cafe')).pictures;

const KNOWN_IMAGES: ReadonlySet<string> = new Set(PHOTO_FILES.map((file) => `street-views/${file}`));

describe('the street views of generated places', () => {
  it('are given to about one place in three', () => {
    expect(viewedShare(many('cafe'))).toBeGreaterThan(0.25);
  });

  it('are not given to most places', () => {
    expect(viewedShare(many('cafe'))).toBeLessThan(0.41);
  });

  it.each(['parking', 'atm', 'charging-station', 'toilets', 'drinking-water', 'cemetery', 'monument', 'station'] as const)(
    'are never given to a place of kind %s',
    (kind) => {
      expect(viewedShare(many(kind))).toBe(0);
    }
  );

  it.each([
    { edge: 'the west', at: { longitude: 2.224, latitude: 48.86 } },
    { edge: 'the east', at: { longitude: 2.47, latitude: 48.86 } },
    { edge: 'the south', at: { longitude: 2.35, latitude: 48.815 } },
    { edge: 'the north', at: { longitude: 2.35, latitude: 48.902 } }
  ])('are given on $edge edge of Paris', ({ at }) => {
    expect(viewedShare(many('cafe', at))).toBeGreaterThan(0);
  });

  it.each([
    { side: 'west', at: { longitude: 2.2239, latitude: 48.86 } },
    { side: 'east', at: { longitude: 2.4701, latitude: 48.86 } },
    { side: 'south', at: { longitude: 2.35, latitude: 48.8149 } },
    { side: 'north', at: { longitude: 2.35, latitude: 48.9021 } }
  ])('are never given $side of Paris', ({ at }) => {
    expect(viewedShare(many('cafe', at))).toBe(0);
  });
});

describe('the tags of a place with a street view', () => {
  it('name the picture after the place', () => {
    const { places, pictures } = fakeStreetViews([], many('cafe'));
    const picture = pictures[0]?.id;
    expect(places.find((place) => place.id === picture)?.tags).toEqual({ panoramax: picture });
  });

  it('keep the other tags', () => {
    const tagged = Array.from({ length: 30 }, (_, index) => placeOf(`bar-${index}`, 'bar', CENTRE, SEATING));
    expect(fakeStreetViews([], tagged).places.find((place) => place.tags?.['panoramax'] !== undefined)?.tags).toMatchObject(
      SEATING
    );
  });

  it('are those of before for places without one', () => {
    const places = many('parking');
    expect(fakeStreetViews([], places).places).toEqual(places);
  });
});

describe('the camera of a street view', () => {
  it('is 4 m away at least', () => {
    expect(Math.min(...PICTURES.map(({ camera }) => metresBetween(camera, CENTRE)))).toBeGreaterThan(3.9);
  });

  it('is 18 m away at most', () => {
    expect(Math.max(...PICTURES.map(({ camera }) => metresBetween(camera, CENTRE)))).toBeLessThan(18.1);
  });

  it('stands on every side of the place', () => {
    expect(new Set(PICTURES.map(({ azimuth }) => Math.floor(azimuth / 90))).size).toBe(4);
  });

  it('looks at the place', () => {
    expect(
      Math.max(...PICTURES.map(({ camera, azimuth }) => Math.abs(((headingFrom(camera, CENTRE) - azimuth + 540) % 360) - 180)))
    ).toBeLessThan(1);
  });

  it('heads from 0° up to 360°, not included', () => {
    expect(PICTURES.every(({ azimuth }) => azimuth >= 0 && azimuth < 360)).toBe(true);
  });

  it('stands to a tenth of a metre', () => {
    expect(PICTURES.every(({ camera }) => camera.longitude === Number(camera.longitude.toFixed(6)))).toBe(true);
  });

  it('rounds its latitude too', () => {
    expect(PICTURES.every(({ camera }) => camera.latitude === Number(camera.latitude.toFixed(6)))).toBe(true);
  });
});

describe('the image of a street view', () => {
  it('is of the site', () => {
    expect(PICTURES.filter(({ image }) => !KNOWN_IMAGES.has(image))).toEqual([]);
  });

  it('shows the colours of the family of the place', () => {
    expect(new Set(PICTURES.map(({ image }) => image.slice(0, image.lastIndexOf('-'))))).toEqual(
      new Set(['street-views/cafe'])
    );
  });

  it('comes in every shade', () => {
    expect(new Set(PICTURES.map(({ image }) => image))).toHaveLength(12);
  });

  it('is that of places without a family when the kind has none', () => {
    expect(fakeStreetViews([placeOf('lieu', 'police', CENTRE, streetViewByHand('lieu'))], []).pictures[0]?.image).toMatch(
      IMAGE_WITHOUT_FAMILY
    );
  });

  it('is the same at each build', () => {
    expect(fakeStreetViews([], many('cafe')).pictures).toEqual(PICTURES);
  });
});

describe('the street views of landmarks', () => {
  it('are those chosen by hand', () => {
    const chosen = placeOf('cafe-de-flore', 'cafe', CENTRE, streetViewByHand('cafe-de-flore'));
    expect(fakeStreetViews([chosen], []).pictures.map(({ id }) => id)).toEqual(['cafe-de-flore']);
  });

  it('are never drawn at random', () => {
    expect(fakeStreetViews(many('cafe'), []).pictures).toEqual([]);
  });

  it('come first', () => {
    const chosen = placeOf('cafe-de-flore', 'cafe', CENTRE, streetViewByHand('cafe-de-flore'));
    expect(fakeStreetViews([chosen], many('cafe')).pictures[0]?.id).toBe('cafe-de-flore');
  });
});
