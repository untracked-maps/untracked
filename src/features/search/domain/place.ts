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

type Place = {
  readonly id: string;
  readonly name: string;
  readonly kind: PlaceKind;
  readonly address: string;
  readonly coordinates: Coordinates;
  readonly fame: number;
};

type LoadPlaces = () => Observable<readonly Place[]>;

export { type Coordinates, type LoadPlaces, PLACE_KINDS, type Place, type PlaceKind };
