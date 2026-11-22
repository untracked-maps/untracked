import { m } from '#i18n/messages';
import type { AddressLine } from '#libraries/postal-address/address-line.presenter';
import type { AddressKind } from '../../domain/found';
import type { PlaceKind, PostalAddress } from '../../domain/place';

const KIND_LABELS: Readonly<Record<PlaceKind | AddressKind, () => string>> = {
  address: m.search_places_kind_address,
  attraction: m.search_places_kind_attraction,
  bakery: m.search_places_kind_bakery,
  bar: m.search_places_kind_bar,
  'beauty-salon': m.search_places_kind_beauty_salon,
  bookshop: m.search_places_kind_bookshop,
  cafe: m.search_places_kind_cafe,
  cinema: m.search_places_kind_cinema,
  district: m.search_places_kind_district,
  'department-store': m.search_places_kind_department_store,
  florist: m.search_places_kind_florist,
  garden: m.search_places_kind_garden,
  hairdresser: m.search_places_kind_hairdresser,
  hospital: m.search_places_kind_hospital,
  hotel: m.search_places_kind_hotel,
  library: m.search_places_kind_library,
  monument: m.search_places_kind_monument,
  museum: m.search_places_kind_museum,
  park: m.search_places_kind_park,
  parking: m.search_places_kind_parking,
  pharmacy: m.search_places_kind_pharmacy,
  'place-of-worship': m.search_places_kind_place_of_worship,
  'post-office': m.search_places_kind_post_office,
  restaurant: m.search_places_kind_restaurant,
  school: m.search_places_kind_school,
  station: m.search_places_kind_station,
  street: m.search_places_kind_street,
  supermarket: m.search_places_kind_supermarket,
  theatre: m.search_places_kind_theatre
};

type Described = {
  readonly kind: PlaceKind | AddressKind;
  readonly address: PostalAddress;
};

const detailsOf =
  (line: AddressLine | undefined) =>
  ({ kind, address }: Described): string =>
    line === undefined ? KIND_LABELS[kind]() : m.search_places_details({ kind: KIND_LABELS[kind](), address: line(address) });

export { detailsOf };
