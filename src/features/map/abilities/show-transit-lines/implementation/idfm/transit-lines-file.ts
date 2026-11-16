import type { TransitLine, TransitMode } from '../../domain/show-transit-lines';

type FetchFile = (url: string) => Promise<Response>;

type Position = TransitLine['path'][number];

const IDFM_TRANSIT_LINES =
  'https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/traces-du-reseau-ferre-idf/exports/geojson?select=geo_shape,mode,colourweb_hexa';

const MODES: ReadonlyMap<unknown, TransitMode> = new Map([
  ['METRO', 'metro'],
  ['RER', 'rer'],
  ['TRAIN', 'train'],
  ['TER', 'train'],
  ['TRAMWAY', 'tram']
]);

const WEB_COLOUR = /^[0-9a-f]{6}$/iu;

const isPosition = (value: unknown): value is Position =>
  Array.isArray(value) && typeof value[0] === 'number' && typeof value[1] === 'number';

const pathOf = (geometry: unknown): readonly Position[] =>
  geometry instanceof Object &&
  'type' in geometry &&
  geometry.type === 'LineString' &&
  'coordinates' in geometry &&
  Array.isArray(geometry.coordinates) &&
  geometry.coordinates.every(isPosition)
    ? geometry.coordinates.map(([longitude, latitude]: Position): Position => [longitude, latitude])
    : [];

const colourOf = (colour: unknown): string | undefined =>
  typeof colour === 'string' && WEB_COLOUR.test(colour) ? `#${colour}` : undefined;

const lineOf = (properties: object, path: readonly Position[]): TransitLine => ({
  mode: MODES.get(Reflect.get(properties, 'mode')) ?? 'other',
  colour: colourOf(Reflect.get(properties, 'colourweb_hexa')),
  path
});

const linesOf = (feature: unknown): readonly TransitLine[] => {
  const path = feature instanceof Object && 'geometry' in feature ? pathOf(feature.geometry) : [];
  return path.length > 1 && feature instanceof Object && 'properties' in feature && feature.properties instanceof Object
    ? [lineOf(feature.properties, path)]
    : [];
};

const transitLinesIn = (file: unknown): readonly TransitLine[] =>
  file instanceof Object && 'features' in file && Array.isArray(file.features) ? file.features.flatMap(linesOf) : [];

const transitLinesFrom = async (fetchFile: FetchFile): Promise<readonly TransitLine[]> => {
  const response = await fetchFile(IDFM_TRANSIT_LINES);
  if (!response.ok) {
    throw new Error(`Île-de-France Mobilités answered ${response.status}.`);
  }
  return transitLinesIn(await response.json());
};

export { type FetchFile, transitLinesFrom };
