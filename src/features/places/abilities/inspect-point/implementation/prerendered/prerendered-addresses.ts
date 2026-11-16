import { defer, map, type Observable } from 'rxjs';
import type { Coordinates } from '../../domain/inspect-point';

type KnownAddress = {
  readonly address: string;
  readonly coordinates: Coordinates;
};

type LoadAddresses = () => Observable<readonly KnownAddress[]>;

type FetchFile = (url: string) => Promise<Response>;

const isCoordinates = (value: unknown): value is Coordinates =>
  value instanceof Object &&
  'longitude' in value &&
  typeof value.longitude === 'number' &&
  'latitude' in value &&
  typeof value.latitude === 'number';

const isKnownAddress = (value: unknown): value is KnownAddress =>
  value instanceof Object &&
  'address' in value &&
  typeof value.address === 'string' &&
  'coordinates' in value &&
  isCoordinates(value.coordinates);

const addressesIn = (file: unknown): readonly KnownAddress[] => (Array.isArray(file) ? file.filter(isKnownAddress) : []);

const contentOf = async (response: Response): Promise<unknown> => {
  if (!response.ok) {
    throw new Error(`The addresses file answered ${response.status}.`);
  }
  return await response.json();
};

const prerenderedAddresses =
  (fetchFile: FetchFile, url: string): LoadAddresses =>
  (): Observable<readonly KnownAddress[]> =>
    defer(async () => contentOf(await fetchFile(url))).pipe(map(addressesIn));

export { type KnownAddress, type LoadAddresses, prerenderedAddresses };
