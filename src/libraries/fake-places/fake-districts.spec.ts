import { describe, expect, it } from 'vitest';
import { fakeDistricts } from './fake-districts';
import type { FakeZone } from './fake-zone';
import { PARIS } from './zones/paris/paris';

const TWO_DISTRICTS: FakeZone = {
  ...PARIS,
  city: 'Saint-Malo',
  districts: [
    { name: 'Intra-Muros', postcode: '35400', coordinates: { longitude: -2.025, latitude: 48.649 } },
    { name: 'Saint-Servan', postcode: '35400', coordinates: { longitude: -2.025, latitude: 48.639 } }
  ]
};

const ONE_DISTRICT: FakeZone = { ...TWO_DISTRICTS, districts: TWO_DISTRICTS.districts.slice(0, 1) };

const ALONG_A_PARALLEL: FakeZone = {
  ...TWO_DISTRICTS,
  districts: [
    { name: 'Intra-Muros', postcode: '35400', coordinates: { longitude: -2.025, latitude: 48.649 } },
    { name: 'Paramé', postcode: '35400', coordinates: { longitude: -2.005, latitude: 48.649 } },
    { name: 'Rothéneuf', postcode: '35400', coordinates: { longitude: -1.925, latitude: 48.649 } }
  ]
};

const DISTRICTS = fakeDistricts(TWO_DISTRICTS);

const [INTRA_MUROS] = DISTRICTS.features;

const RING = INTRA_MUROS?.geometry.coordinates[0] ?? [];

const latitudesOf = (ring: readonly (readonly number[])[]): readonly number[] => ring.map(([, latitude = 0]) => latitude);

describe('fake districts', () => {
  it('are a GeoJSON feature collection', () => {
    expect(DISTRICTS.type).toBe('FeatureCollection');
  });

  it('hold a feature for each district of their zone', () => {
    expect(fakeDistricts(PARIS).features).toHaveLength(PARIS.districts.length);
  });

  it('name a district, its postcode and its city', () => {
    expect(INTRA_MUROS?.properties).toEqual({ name: 'Intra-Muros', postalCode: '35400', addressLocality: 'Saint-Malo' });
  });

  it('outline a district with a polygon', () => {
    expect(INTRA_MUROS?.geometry.type).toBe('Polygon');
  });

  it('close the ring of an outline on its first position', () => {
    expect(RING.at(-1)).toEqual(RING[0]);
  });

  it('draw the outline with sixteen corners', () => {
    expect(RING).toHaveLength(17);
  });

  it('keep the outline of a district short of its nearest neighbour', () => {
    expect(Math.min(...latitudesOf(RING))).toBeGreaterThan(48.644);
  });

  it('go around the centre of the district', () => {
    expect(Math.max(...latitudesOf(RING))).toBeGreaterThan(48.649);
  });

  it('give a district alone in its zone an outline of a kilometre across', () => {
    expect(Math.max(...latitudesOf(fakeDistricts(ONE_DISTRICT).features[0]?.geometry.coordinates[0] ?? []))).toBe(48.653_49);
  });

  it('round the positions to five decimals', () => {
    expect(RING[0]).toEqual([-2.025, 48.6535]);
  });
});

describe('the outline of a fake district', () => {
  it('stops short of the nearest neighbour along a parallel, the distance shortened by the latitude along a parallel, shortened by the latitude', () => {
    expect(Math.max(...latitudesOf(fakeDistricts(ALONG_A_PARALLEL).features[0]?.geometry.coordinates[0] ?? []))).toBe(
      48.654_95
    );
  });

  it('has its corner at a quarter turn due east of the centre', () => {
    expect(fakeDistricts(ONE_DISTRICT).features[0]?.geometry.coordinates[0]?.[4]).toEqual([-2.0182, 48.649]);
  });
});
