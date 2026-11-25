import type { Observable } from 'rxjs';

const PLACE_KINDS = [
  'atm',
  'attraction',
  'bakery',
  'bank',
  'bar',
  'beauty-salon',
  'bicycle',
  'bookshop',
  'butcher',
  'cafe',
  'cemetery',
  'charging-station',
  'cheese',
  'chocolate',
  'cinema',
  'clothes',
  'coworking',
  'deli',
  'department-store',
  'diy',
  'doctor',
  'drinking-water',
  'escape-game',
  'fast-food',
  'fitness-centre',
  'florist',
  'fuel',
  'garden',
  'greengrocer',
  'hairdresser',
  'hospital',
  'hotel',
  'ice-cream',
  'laundry',
  'library',
  'marketplace',
  'mobile-phone',
  'monument',
  'museum',
  'music',
  'newsagent',
  'nightclub',
  'optician',
  'park',
  'parking',
  'pet-shop',
  'pharmacy',
  'place-of-worship',
  'playground',
  'police',
  'post-office',
  'restaurant',
  'school',
  'station',
  'stationery',
  'supermarket',
  'swimming-pool',
  'theatre',
  'toilets',
  'townhall',
  'toys',
  'veterinary',
  'wine'
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
