import { m } from '#i18n/messages';
import type { AddressLine } from '#libraries/postal-address/address-line.presenter';
import { type AddressKind, isAddress } from '../../domain/found';
import type { PlaceKind, PostalAddress } from '../../domain/place';

const KIND_LABELS: Readonly<Record<PlaceKind | AddressKind, () => string>> = {
  address: m.search_places_kind_address,
  atm: m.search_places_kind_atm,
  attraction: m.search_places_kind_attraction,
  bakery: m.search_places_kind_bakery,
  bank: m.search_places_kind_bank,
  bar: m.search_places_kind_bar,
  'beauty-salon': m.search_places_kind_beauty_salon,
  bicycle: m.search_places_kind_bicycle,
  bookshop: m.search_places_kind_bookshop,
  butcher: m.search_places_kind_butcher,
  cafe: m.search_places_kind_cafe,
  cemetery: m.search_places_kind_cemetery,
  'charging-station': m.search_places_kind_charging_station,
  cheese: m.search_places_kind_cheese,
  chocolate: m.search_places_kind_chocolate,
  cinema: m.search_places_kind_cinema,
  clothes: m.search_places_kind_clothes,
  coworking: m.search_places_kind_coworking,
  deli: m.search_places_kind_deli,
  'department-store': m.search_places_kind_department_store,
  district: m.search_places_kind_district,
  diy: m.search_places_kind_diy,
  doctor: m.search_places_kind_doctor,
  'drinking-water': m.search_places_kind_drinking_water,
  'escape-game': m.search_places_kind_escape_game,
  'fast-food': m.search_places_kind_fast_food,
  'fitness-centre': m.search_places_kind_fitness_centre,
  florist: m.search_places_kind_florist,
  fuel: m.search_places_kind_fuel,
  garden: m.search_places_kind_garden,
  greengrocer: m.search_places_kind_greengrocer,
  hairdresser: m.search_places_kind_hairdresser,
  hospital: m.search_places_kind_hospital,
  hotel: m.search_places_kind_hotel,
  'ice-cream': m.search_places_kind_ice_cream,
  laundry: m.search_places_kind_laundry,
  library: m.search_places_kind_library,
  marketplace: m.search_places_kind_marketplace,
  'mobile-phone': m.search_places_kind_mobile_phone,
  monument: m.search_places_kind_monument,
  museum: m.search_places_kind_museum,
  music: m.search_places_kind_music,
  newsagent: m.search_places_kind_newsagent,
  nightclub: m.search_places_kind_nightclub,
  optician: m.search_places_kind_optician,
  park: m.search_places_kind_park,
  parking: m.search_places_kind_parking,
  'pet-shop': m.search_places_kind_pet_shop,
  pharmacy: m.search_places_kind_pharmacy,
  'place-of-worship': m.search_places_kind_place_of_worship,
  playground: m.search_places_kind_playground,
  police: m.search_places_kind_police,
  'post-office': m.search_places_kind_post_office,
  restaurant: m.search_places_kind_restaurant,
  school: m.search_places_kind_school,
  station: m.search_places_kind_station,
  stationery: m.search_places_kind_stationery,
  street: m.search_places_kind_street,
  supermarket: m.search_places_kind_supermarket,
  'swimming-pool': m.search_places_kind_swimming_pool,
  theatre: m.search_places_kind_theatre,
  toilets: m.search_places_kind_toilets,
  townhall: m.search_places_kind_townhall,
  toys: m.search_places_kind_toys,
  veterinary: m.search_places_kind_veterinary,
  wine: m.search_places_kind_wine
};

type Described = {
  readonly kind: PlaceKind | AddressKind;
  readonly address: PostalAddress;
};

const localityOf = ({ postalCode, addressLocality, addressCountry }: PostalAddress): PostalAddress => ({
  postalCode,
  addressLocality,
  addressCountry
});

const shownOf = ({ kind, address }: Described): PostalAddress => (isAddress({ kind }) ? localityOf(address) : address);

const detailsOf =
  (line: AddressLine | undefined) =>
  (described: Described): string =>
    line === undefined
      ? KIND_LABELS[described.kind]()
      : m.search_places_details({ kind: KIND_LABELS[described.kind](), address: line(shownOf(described)) });

export { detailsOf };
