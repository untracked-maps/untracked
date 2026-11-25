import { defer, map, type Observable } from 'rxjs';
import type { Coordinates, PostalAddress } from '../../domain/inspect-point';

type KnownAddress = {
  readonly address: PostalAddress;
  readonly coordinates: Coordinates;
};

type LoadAddresses = () => Observable<readonly KnownAddress[]>;

type FetchFile = (url: string) => Promise<Response>;

type Fields = Readonly<Record<string, unknown>>;

const isFields = (value: unknown): value is Fields => typeof value === 'object' && value !== null;

const isCoordinates = (value: unknown): value is Coordinates =>
  isFields(value) && typeof value['longitude'] === 'number' && typeof value['latitude'] === 'number';

const houseNumberOf = ({ houseNumber }: Fields): readonly Pick<PostalAddress, 'houseNumber'>[] => {
  if (houseNumber === undefined) {
    return [{}];
  }
  return typeof houseNumber === 'string' ? [{ houseNumber }] : [];
};

const knownOf = (fields: Fields): readonly KnownAddress[] => {
  const { street, postalCode, addressLocality, addressCountry, coordinates } = fields;
  return typeof street === 'string' &&
    typeof postalCode === 'string' &&
    typeof addressLocality === 'string' &&
    typeof addressCountry === 'string' &&
    isCoordinates(coordinates)
    ? houseNumberOf(fields).map((number) => ({
        address: { ...number, street, postalCode, addressLocality, addressCountry },
        coordinates: { longitude: coordinates.longitude, latitude: coordinates.latitude }
      }))
    : [];
};

const addressesIn = (file: unknown): readonly KnownAddress[] =>
  Array.isArray(file) ? file.flatMap((value: unknown) => (isFields(value) ? knownOf(value) : [])) : [];

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
