import { defer, map, type Observable } from 'rxjs';
import type { KnownOutline, LoadOutlines } from '../../domain/open-district';

type FetchFile = (url: string) => Promise<Response>;

type Fields = Readonly<Record<string, unknown>>;

type Outline = KnownOutline['outline'];

const isFields = (value: unknown): value is Fields => typeof value === 'object' && value !== null;

const isPosition = (value: unknown): value is readonly [number, number] =>
  Array.isArray(value) && typeof value[0] === 'number' && typeof value[1] === 'number';

const ringOf = (value: unknown): readonly Outline[] =>
  Array.isArray(value) && value.every(isPosition) ? [value.map(([longitude, latitude]) => ({ longitude, latitude }))] : [];

const outerRingOf = (geometry: unknown): readonly Outline[] =>
  isFields(geometry) && geometry['type'] === 'Polygon' && Array.isArray(geometry['coordinates'])
    ? geometry['coordinates'].slice(0, 1).flatMap(ringOf)
    : [];

const outlineOf = (feature: unknown): readonly KnownOutline[] => {
  const properties = isFields(feature) ? feature['properties'] : undefined;
  if (!(isFields(feature) && isFields(properties))) {
    return [];
  }
  const { name, postalCode } = properties;
  return typeof name === 'string' && typeof postalCode === 'string'
    ? outerRingOf(feature['geometry']).map((outline) => ({ name, postalCode, outline }))
    : [];
};

const outlinesIn = (file: unknown): readonly KnownOutline[] =>
  isFields(file) && file['type'] === 'FeatureCollection' && Array.isArray(file['features'])
    ? file['features'].flatMap(outlineOf)
    : [];

const contentOf = async (response: Response): Promise<unknown> => {
  if (!response.ok) {
    throw new Error(`The districts file answered ${response.status}.`);
  }
  return await response.json();
};

const prerenderedOutlines =
  (fetchFile: FetchFile, url: string): LoadOutlines =>
  (): Observable<readonly KnownOutline[]> =>
    defer(async () => contentOf(await fetchFile(url))).pipe(map(outlinesIn));

export { prerenderedOutlines };
