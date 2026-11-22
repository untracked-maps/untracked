import { defer, map, shareReplay } from 'rxjs';
import {
  type Coordinates,
  isPostalAddress,
  type LoadPlaces,
  PLACE_KINDS,
  type Place,
  type PlaceKind
} from '../../domain/place';

type FetchFile = (url: string) => Promise<Response>;

type Fields = Readonly<Record<string, unknown>>;

const KNOWN_KINDS: ReadonlySet<unknown> = new Set(PLACE_KINDS);

const isFields = (value: unknown): value is Fields => typeof value === 'object' && value !== null;

const isPlaceKind = (value: unknown): value is PlaceKind => KNOWN_KINDS.has(value);

const isCoordinates = (value: unknown): value is Coordinates =>
  isFields(value) && typeof value['longitude'] === 'number' && typeof value['latitude'] === 'number';

const cuisineOf = ({ cuisine }: Fields): Pick<Place, 'cuisine'> => (typeof cuisine === 'string' ? { cuisine } : {});

const placeOf = (value: unknown): readonly Place[] => {
  if (!isFields(value)) {
    return [];
  }
  const { id, name, kind, address, coordinates, fame } = value;
  return typeof id === 'string' &&
    typeof name === 'string' &&
    isPlaceKind(kind) &&
    isPostalAddress(address) &&
    isCoordinates(coordinates) &&
    typeof fame === 'number'
    ? [{ id, name, kind, ...cuisineOf(value), address, coordinates, fame }]
    : [];
};

const placesIn = (file: unknown): readonly Place[] => (Array.isArray(file) ? file.flatMap(placeOf) : []);

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
