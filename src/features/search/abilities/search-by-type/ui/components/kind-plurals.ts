import { m } from '#i18n/messages';
import type { PlaceKind } from '../../../../domain/place';

const KIND_PLURALS: Readonly<Record<PlaceKind, () => string>> = {
  attraction: m.search_by_type_kinds_attraction,
  bakery: m.search_by_type_kinds_bakery,
  bar: m.search_by_type_kinds_bar,
  'beauty-salon': m.search_by_type_kinds_beauty_salon,
  bookshop: m.search_by_type_kinds_bookshop,
  cafe: m.search_by_type_kinds_cafe,
  cinema: m.search_by_type_kinds_cinema,
  'department-store': m.search_by_type_kinds_department_store,
  florist: m.search_by_type_kinds_florist,
  garden: m.search_by_type_kinds_garden,
  hairdresser: m.search_by_type_kinds_hairdresser,
  hospital: m.search_by_type_kinds_hospital,
  hotel: m.search_by_type_kinds_hotel,
  library: m.search_by_type_kinds_library,
  monument: m.search_by_type_kinds_monument,
  museum: m.search_by_type_kinds_museum,
  park: m.search_by_type_kinds_park,
  parking: m.search_by_type_kinds_parking,
  pharmacy: m.search_by_type_kinds_pharmacy,
  'place-of-worship': m.search_by_type_kinds_place_of_worship,
  'post-office': m.search_by_type_kinds_post_office,
  restaurant: m.search_by_type_kinds_restaurant,
  school: m.search_by_type_kinds_school,
  station: m.search_by_type_kinds_station,
  supermarket: m.search_by_type_kinds_supermarket,
  theatre: m.search_by_type_kinds_theatre
};

const pluralOf = (kind: PlaceKind): string => KIND_PLURALS[kind]();

export { pluralOf };
