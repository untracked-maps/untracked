import { defer, map, type Observable } from 'rxjs';
import type { LoadPlaces, PostalAddress, SheetPlace } from '../../domain/open-place';

type FetchFile = (url: string) => Promise<Response>;

type Fields = Readonly<Record<string, unknown>>;

type Coordinates = SheetPlace['coordinates'];

const isFields = (value: unknown): value is Fields => typeof value === 'object' && value !== null;

const isOptionalText = (value: unknown): boolean => value === undefined || typeof value === 'string';

const isCoordinates = (value: unknown): value is Coordinates =>
  isFields(value) && typeof value['longitude'] === 'number' && typeof value['latitude'] === 'number';

const isPostalAddress = (value: unknown): value is PostalAddress =>
  isFields(value) &&
  isOptionalText(value['houseNumber']) &&
  isOptionalText(value['street']) &&
  typeof value['postalCode'] === 'string' &&
  typeof value['addressLocality'] === 'string' &&
  typeof value['addressCountry'] === 'string';

const textField = (fields: Fields, key: 'kind' | 'cuisine' | 'family'): Partial<Record<typeof key, string>> => {
  const value = fields[key];
  return typeof value === 'string' ? { [key]: value } : {};
};

const addressField = ({ address }: Fields): Pick<SheetPlace, 'address'> => (isPostalAddress(address) ? { address } : {});

const placeOf = (value: unknown): readonly SheetPlace[] => {
  if (!isFields(value)) {
    return [];
  }
  const { id, name, coordinates } = value;
  return typeof id === 'string' && typeof name === 'string' && isCoordinates(coordinates)
    ? [
        {
          id,
          name,
          ...textField(value, 'kind'),
          ...textField(value, 'cuisine'),
          ...textField(value, 'family'),
          ...addressField(value),
          coordinates
        }
      ]
    : [];
};

const contentOf = async (response: Response): Promise<unknown> => {
  if (!response.ok) {
    throw new Error(`The places file answered ${response.status}.`);
  }
  return await response.json();
};

const placesIn = (file: unknown): readonly SheetPlace[] => (Array.isArray(file) ? file.flatMap(placeOf) : []);

const prerenderedPlaces =
  (fetchFile: FetchFile, url: string): LoadPlaces =>
  (): Observable<readonly SheetPlace[]> =>
    defer(async () => contentOf(await fetchFile(url))).pipe(map(placesIn));

export { prerenderedPlaces };
