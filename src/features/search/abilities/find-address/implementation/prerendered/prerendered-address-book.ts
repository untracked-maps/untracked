import { defer, map, type Observable } from 'rxjs';
import type { Coordinates } from '../../../../domain/place';
import { normalised } from '../../../../domain/text';
import type { LoadAddresses } from '../../domain/find-address';
import type { KnownAddress } from '../../domain/known-address';

type FetchFile = (url: string) => Promise<Response>;

type Fields = Readonly<Record<string, unknown>>;

type Located = {
  readonly postcode: string;
  readonly city: string;
  readonly coordinates: Coordinates;
};

type Parse = (fields: Fields, located: Located) => readonly KnownAddress[];

type HouseAddress = Extract<KnownAddress, { readonly kind: 'address' }>;

const isObject = (value: unknown): value is Fields => typeof value === 'object' && value !== null;

const isCoordinates = (value: unknown): value is Coordinates =>
  isObject(value) && typeof value['longitude'] === 'number' && typeof value['latitude'] === 'number';

const locatedOf = ({ postcode, city, coordinates }: Fields): readonly Located[] =>
  typeof postcode === 'string' && typeof city === 'string' && isCoordinates(coordinates)
    ? [{ postcode, city, coordinates }]
    : [];

const houseOf: Parse = ({ number, street }, { postcode, city, coordinates }): readonly KnownAddress[] =>
  typeof number === 'string' && typeof street === 'string'
    ? [{ kind: 'address', number, street, postcode, city, coordinates }]
    : [];

const streetOnlyOf: Parse = ({ street }, { postcode, city, coordinates }): readonly KnownAddress[] =>
  typeof street === 'string' ? [{ kind: 'street', street, postcode, city, coordinates }] : [];

const districtOf: Parse = ({ name }, { postcode, city, coordinates }): readonly KnownAddress[] =>
  typeof name === 'string' ? [{ kind: 'district', name, postcode, city, coordinates }] : [];

const PARSERS: ReadonlyMap<unknown, Parse> = new Map<unknown, Parse>([
  ['address', houseOf],
  ['street', streetOnlyOf],
  ['district', districtOf]
]);

const parsedOf = (fields: Fields): readonly KnownAddress[] => {
  const parse = PARSERS.get(fields['kind']);
  return parse === undefined ? [] : locatedOf(fields).flatMap((located) => parse(fields, located));
};

const knownOf = (value: unknown): readonly KnownAddress[] => (isObject(value) ? parsedOf(value) : []);

const isHouse = (known: KnownAddress): known is HouseAddress => known.kind === 'address';

const streetKeyOf = ({ street, postcode }: HouseAddress): string => `${postcode} ${normalised(street)}`;

const meanOf = (values: readonly number[]): number => values.reduce((sum, value) => sum + value, 0) / values.length;

const streetOf = (houses: readonly HouseAddress[]): readonly KnownAddress[] =>
  houses.slice(0, 1).map(({ street, postcode, city }) => ({
    kind: 'street',
    street,
    postcode,
    city,
    coordinates: {
      longitude: meanOf(houses.map(({ coordinates }) => coordinates.longitude)),
      latitude: meanOf(houses.map(({ coordinates }) => coordinates.latitude))
    }
  }));

const streetsOf = (known: readonly KnownAddress[]): readonly KnownAddress[] =>
  [...Map.groupBy(known.filter(isHouse), streetKeyOf).values()].flatMap(streetOf);

const addressBookIn = (file: unknown): readonly KnownAddress[] => {
  const known = Array.isArray(file) ? file.flatMap(knownOf) : [];
  return [...known, ...streetsOf(known)];
};

const contentOf = async (response: Response): Promise<unknown> => {
  if (!response.ok) {
    throw new Error(`The addresses file answered ${response.status}.`);
  }
  return await response.json();
};

const prerenderedAddressBook =
  (fetchFile: FetchFile, url: string): LoadAddresses =>
  (): Observable<readonly KnownAddress[]> =>
    defer(async () => contentOf(await fetchFile(url))).pipe(map(addressBookIn));

export { prerenderedAddressBook };
