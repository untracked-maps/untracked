import { defer, map, type Observable } from 'rxjs';
import type { LoadPlaces, PostalAddress, SheetPlace } from '../../domain/open-place';

type FetchFile = () => Promise<Response>;

type PlaceFiles = {
  readonly places: FetchFile;
  readonly details: FetchFile;
};

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

const TEXT_FIELDS = ['kind', 'cuisine', 'family', 'phone', 'website', 'menu', 'instagram', 'facebook'] as const;

type TextFields = Partial<Pick<SheetPlace, (typeof TEXT_FIELDS)[number]>>;

const textFields = (fields: Fields): TextFields =>
  Object.fromEntries(
    TEXT_FIELDS.flatMap((key) => {
      const value = fields[key];
      return typeof value === 'string' ? [[key, value]] : [];
    })
  );

const tagsField = ({ tags }: Fields): Pick<SheetPlace, 'tags'> =>
  isFields(tags)
    ? { tags: Object.fromEntries(Object.entries(tags).filter((tag): tag is [string, string] => typeof tag[1] === 'string')) }
    : {};

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
          ...textFields(value),
          ...addressField(value),
          ...tagsField(value),
          coordinates
        }
      ]
    : [];
};

const contentOf =
  (name: string) =>
  async (response: Response): Promise<unknown> => {
    if (!response.ok) {
      throw new Error(`The ${name} file answered ${response.status}.`);
    }
    return await response.json();
  };

const DETAIL_FIELDS = ['phone', 'website', 'menu', 'instagram', 'facebook', 'tags'] as const;

const detailFieldsOf = (value: Fields): Fields =>
  Object.fromEntries(DETAIL_FIELDS.flatMap((key) => (key in value ? [[key, value[key]]] : [])));

const detailsById = (file: unknown): ReadonlyMap<unknown, Fields> =>
  new Map(Array.isArray(file) ? file.filter(isFields).map((details) => [details['id'], detailFieldsOf(details)]) : []);

const joined =
  (details: ReadonlyMap<unknown, Fields>) =>
  (value: unknown): unknown =>
    isFields(value) ? { ...value, ...details.get(value['id']) } : value;

const placesIn = ([places, details]: readonly [unknown, unknown]): readonly SheetPlace[] =>
  Array.isArray(places) ? places.map(joined(detailsById(details))).flatMap(placeOf) : [];

const prerenderedPlaces =
  (files: PlaceFiles): LoadPlaces =>
  (): Observable<readonly SheetPlace[]> =>
    defer(async () =>
      Promise.all([files.places().then(contentOf('places')), files.details().then(contentOf('details'))] as const)
    ).pipe(map(placesIn));

export { prerenderedPlaces };
