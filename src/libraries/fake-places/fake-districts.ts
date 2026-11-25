import type { FakeDistrictOfZone, FakeZone } from './fake-zone';

type Position = readonly [number, number];

type FakeDistrictFeature = {
  readonly type: 'Feature';
  readonly properties: { readonly name: string; readonly postalCode: string; readonly addressLocality: string };
  readonly geometry: { readonly type: 'Polygon'; readonly coordinates: readonly (readonly Position[])[] };
};

type FakeDistricts = {
  readonly type: 'FeatureCollection';
  readonly features: readonly FakeDistrictFeature[];
};

type FakeCoordinates = FakeDistrictOfZone['coordinates'];

const CORNERS = 16;

const FULL_TURN = 2 * Math.PI;

const SHARE_OF_NEIGHBOUR = 0.45;

const LONE_RADIUS_METRES = 500;

const METRES_PER_DEGREE = 111_320;

const DEGREES_PER_HALF_TURN = 180;

const RADIANS_PER_DEGREE = Math.PI / DEGREES_PER_HALF_TURN;

const PRECISION = 100_000;

const metresBetween = (from: FakeCoordinates, to: FakeCoordinates): number =>
  METRES_PER_DEGREE *
  Math.hypot((to.longitude - from.longitude) * Math.cos(from.latitude * RADIANS_PER_DEGREE), to.latitude - from.latitude);

const radiusOf = (district: FakeDistrictOfZone, districts: readonly FakeDistrictOfZone[]): number => {
  const others = districts
    .filter((other) => other !== district)
    .map(({ coordinates }) => metresBetween(district.coordinates, coordinates));
  return others.length === 0 ? LONE_RADIUS_METRES : Math.min(...others) * SHARE_OF_NEIGHBOUR;
};

const rounded = (degrees: number): number => Math.round(degrees * PRECISION) / PRECISION;

const cornerOf =
  ({ longitude, latitude }: FakeCoordinates, radius: number) =>
  (index: number): Position => {
    const angle = (FULL_TURN * index) / CORNERS;
    const north = (radius * Math.cos(angle)) / METRES_PER_DEGREE;
    const east = (radius * Math.sin(angle)) / (METRES_PER_DEGREE * Math.cos(latitude * RADIANS_PER_DEGREE));
    return [rounded(longitude + east), rounded(latitude + north)];
  };

const ringOf = (centre: FakeCoordinates, radius: number): readonly Position[] =>
  Array.from({ length: CORNERS + 1 }, (_, index) => cornerOf(centre, radius)(index % CORNERS));

const featureOf =
  ({ city, districts }: FakeZone) =>
  (district: FakeDistrictOfZone): FakeDistrictFeature => ({
    type: 'Feature',
    properties: { name: district.name, postalCode: district.postcode, addressLocality: city },
    geometry: { type: 'Polygon', coordinates: [ringOf(district.coordinates, radiusOf(district, districts))] }
  });

const fakeDistricts = (zone: FakeZone): FakeDistricts => ({
  type: 'FeatureCollection',
  features: zone.districts.map(featureOf(zone))
});

export { fakeDistricts };
