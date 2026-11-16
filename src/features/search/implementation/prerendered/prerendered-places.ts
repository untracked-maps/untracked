import { defer, map, shareReplay } from 'rxjs';
import { type Coordinates, type LoadPlaces, PLACE_KINDS, type Place, type PlaceKind } from '../../domain/place';

type FetchFile = (url: string) => Promise<Response>;

const KNOWN_KINDS: ReadonlySet<unknown> = new Set(PLACE_KINDS);

const isPlaceKind = (value: unknown): value is PlaceKind => KNOWN_KINDS.has(value);

const isCoordinates = (value: unknown): value is Coordinates =>
  value instanceof Object &&
  'longitude' in value &&
  typeof value.longitude === 'number' &&
  'latitude' in value &&
  typeof value.latitude === 'number';

const isPlace = (value: unknown): value is Place =>
  value instanceof Object &&
  'id' in value &&
  typeof value.id === 'string' &&
  'name' in value &&
  typeof value.name === 'string' &&
  'kind' in value &&
  isPlaceKind(value.kind) &&
  'address' in value &&
  typeof value.address === 'string' &&
  'coordinates' in value &&
  isCoordinates(value.coordinates) &&
  'fame' in value &&
  typeof value.fame === 'number';

const placesIn = (file: unknown): readonly Place[] => (Array.isArray(file) ? file.filter(isPlace) : []);

const contentOf = async (response: Response): Promise<unknown> => {
  if (!response.ok) {
    throw new Error(`The places file answered ${response.status}.`);
  }
  return await response.json();
};

const prerenderedPlaces = (fetchFile: FetchFile, url: string): LoadPlaces => {
  const places$ = defer(async () => contentOf(await fetchFile(url))).pipe(map(placesIn), shareReplay(1));
  return () => places$;
};

export { prerenderedPlaces };
