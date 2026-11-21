import { defer, type Observable, switchMap } from 'rxjs';
import { FAMILIES, type Family, type LoadPlaces, type Place } from '../../domain/show-places';

type FetchFile = (url: string) => Promise<Response>;

const fieldOf = (value: unknown, key: string): unknown => (value instanceof Object ? Reflect.get(value, key) : undefined);

const textOf = (value: unknown, key: string): string | undefined => {
  const field = fieldOf(value, key);
  return typeof field === 'string' ? field : undefined;
};

const numberOf = (value: unknown, key: string): number | undefined => {
  const field = fieldOf(value, key);
  return typeof field === 'number' ? field : undefined;
};

const familyOf = (value: unknown): Family | undefined => FAMILIES.find((family) => family === fieldOf(value, 'family'));

const placeIn = (value: unknown): Place[] => {
  const name = textOf(value, 'name');
  const kind = textOf(value, 'kind');
  const longitude = numberOf(fieldOf(value, 'coordinates'), 'longitude');
  const latitude = numberOf(fieldOf(value, 'coordinates'), 'latitude');
  const minzoom = numberOf(value, 'minzoom');
  const rank = numberOf(value, 'rank');
  return name === undefined ||
    kind === undefined ||
    longitude === undefined ||
    latitude === undefined ||
    minzoom === undefined ||
    rank === undefined
    ? []
    : [{ name, kind, family: familyOf(value), coordinates: { longitude, latitude }, minzoom, rank }];
};

const placesOf = async (response: Response): Promise<readonly Place[]> => {
  if (!response.ok) {
    throw new Error(`The places file answered ${response.status}.`);
  }
  const file: unknown = await response.json();
  return Array.isArray(file) ? file.flatMap(placeIn) : [];
};

const prerenderedPlaces =
  (fetchFile: FetchFile, url: string): LoadPlaces =>
  (): Observable<readonly Place[]> =>
    defer(() => fetchFile(url)).pipe(switchMap(placesOf));

export { prerenderedPlaces };
