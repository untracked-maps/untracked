import type { Observable } from 'rxjs';

const PLACE_KINDS = [
  'attraction',
  'bakery',
  'bar',
  'beauty-salon',
  'bookshop',
  'cafe',
  'cinema',
  'department-store',
  'florist',
  'garden',
  'hairdresser',
  'hospital',
  'hotel',
  'library',
  'monument',
  'museum',
  'park',
  'parking',
  'pharmacy',
  'place-of-worship',
  'post-office',
  'restaurant',
  'school',
  'station',
  'supermarket',
  'theatre'
] as const;

type PlaceKind = (typeof PLACE_KINDS)[number];

type Coordinates = {
  readonly longitude: number;
  readonly latitude: number;
};

type PostalAddress = {
  readonly houseNumber?: string;
  readonly street?: string;
  readonly postalCode: string;
  readonly addressLocality: string;
  readonly addressCountry: string;
};

type Place = {
  readonly id: string;
  readonly name: string;
  readonly kind: PlaceKind;
  readonly cuisine?: string;
  readonly address: PostalAddress;
  readonly coordinates: Coordinates;
  readonly fame: number;
};

type LoadPlaces = () => Observable<readonly Place[]>;

const isOptionalText = (value: unknown): boolean => value === undefined || typeof value === 'string';

const isPostalAddress = (value: unknown): value is PostalAddress =>
  typeof value === 'object' &&
  value !== null &&
  isOptionalText(Reflect.get(value, 'houseNumber')) &&
  isOptionalText(Reflect.get(value, 'street')) &&
  typeof Reflect.get(value, 'postalCode') === 'string' &&
  typeof Reflect.get(value, 'addressLocality') === 'string' &&
  typeof Reflect.get(value, 'addressCountry') === 'string';

export { type Coordinates, isPostalAddress, type LoadPlaces, PLACE_KINDS, type Place, type PlaceKind, type PostalAddress };
