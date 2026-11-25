import { m } from '#i18n/messages';
import type { SheetPlace } from '../../domain/open-place';
import { type PreciseType, preciseTypeOf } from '../../domain/precise-type';

type Typed = Pick<SheetPlace, 'kind' | 'cuisine' | 'tags'>;

type Label = () => string;

const TYPES: ReadonlyMap<string | undefined, Label> = new Map<string | undefined, Label>([
  ['restaurant', m.place_sheet_type_restaurant],
  ['cafe', m.place_sheet_type_cafe],
  ['bar', m.place_sheet_type_bar],
  ['bakery', m.place_sheet_type_bakery],
  ['pharmacy', m.place_sheet_type_pharmacy],
  ['supermarket', m.place_sheet_type_supermarket],
  ['hairdresser', m.place_sheet_type_hairdresser],
  ['beauty-salon', m.place_sheet_type_beauty_salon],
  ['florist', m.place_sheet_type_florist],
  ['bookshop', m.place_sheet_type_bookshop],
  ['hotel', m.place_sheet_type_hotel],
  ['school', m.place_sheet_type_school],
  ['parking', m.place_sheet_type_parking],
  ['park', m.place_sheet_type_park],
  ['museum', m.place_sheet_type_museum],
  ['cinema', m.place_sheet_type_cinema],
  ['library', m.place_sheet_type_library],
  ['post-office', m.place_sheet_type_post_office],
  ['hospital', m.place_sheet_type_hospital],
  ['theatre', m.place_sheet_type_theatre],
  ['attraction', m.place_sheet_type_attraction],
  ['department-store', m.place_sheet_type_department_store],
  ['garden', m.place_sheet_type_garden],
  ['monument', m.place_sheet_type_monument],
  ['place-of-worship', m.place_sheet_type_place_of_worship],
  ['station', m.place_sheet_type_station],
  ['fast-food', m.place_sheet_type_fast_food],
  ['ice-cream', m.place_sheet_type_ice_cream],
  ['chocolate', m.place_sheet_type_chocolate],
  ['deli', m.place_sheet_type_deli],
  ['nightclub', m.place_sheet_type_nightclub],
  ['marketplace', m.place_sheet_type_marketplace],
  ['greengrocer', m.place_sheet_type_greengrocer],
  ['cheese', m.place_sheet_type_cheese],
  ['butcher', m.place_sheet_type_butcher],
  ['wine', m.place_sheet_type_wine],
  ['clothes', m.place_sheet_type_clothes],
  ['newsagent', m.place_sheet_type_newsagent],
  ['diy', m.place_sheet_type_diy],
  ['mobile-phone', m.place_sheet_type_mobile_phone],
  ['toys', m.place_sheet_type_toys],
  ['stationery', m.place_sheet_type_stationery],
  ['music', m.place_sheet_type_music],
  ['atm', m.place_sheet_type_atm],
  ['bank', m.place_sheet_type_bank],
  ['optician', m.place_sheet_type_optician],
  ['laundry', m.place_sheet_type_laundry],
  ['townhall', m.place_sheet_type_townhall],
  ['police', m.place_sheet_type_police],
  ['coworking', m.place_sheet_type_coworking],
  ['doctor', m.place_sheet_type_doctor],
  ['veterinary', m.place_sheet_type_veterinary],
  ['pet-shop', m.place_sheet_type_pet_shop],
  ['escape-game', m.place_sheet_type_escape_game],
  ['playground', m.place_sheet_type_playground],
  ['fitness-centre', m.place_sheet_type_fitness_centre],
  ['swimming-pool', m.place_sheet_type_swimming_pool],
  ['cemetery', m.place_sheet_type_cemetery],
  ['bicycle', m.place_sheet_type_bicycle],
  ['fuel', m.place_sheet_type_fuel],
  ['charging-station', m.place_sheet_type_charging_station],
  ['toilets', m.place_sheet_type_toilets],
  ['drinking-water', m.place_sheet_type_drinking_water]
]);

const PRECISE_TYPES: Readonly<Record<PreciseType, Label>> = {
  cathedral: m.place_sheet_type_cathedral,
  basilica: m.place_sheet_type_basilica,
  chapel: m.place_sheet_type_chapel,
  church: m.place_sheet_type_church,
  monument: m.place_sheet_type_monument,
  palace: m.place_sheet_type_palace,
  tower: m.place_sheet_type_tower,
  museum: m.place_sheet_type_museum,
  'cultural-centre': m.place_sheet_type_cultural_centre,
  theatre: m.place_sheet_type_theatre,
  library: m.place_sheet_type_library,
  garden: m.place_sheet_type_garden,
  park: m.place_sheet_type_park
};

const CUISINES: ReadonlyMap<string | undefined, Label> = new Map<string | undefined, Label>([
  ['french', m.place_sheet_cuisine_french],
  ['italian', m.place_sheet_cuisine_italian],
  ['japanese', m.place_sheet_cuisine_japanese],
  ['chinese', m.place_sheet_cuisine_chinese],
  ['lebanese', m.place_sheet_cuisine_lebanese],
  ['indian', m.place_sheet_cuisine_indian],
  ['vietnamese', m.place_sheet_cuisine_vietnamese],
  ['thai', m.place_sheet_cuisine_thai],
  ['greek', m.place_sheet_cuisine_greek],
  ['mexican', m.place_sheet_cuisine_mexican]
]);

const labelOf = ({ kind, tags }: Typed): Label => {
  const precise = preciseTypeOf(tags);
  return precise === undefined ? (TYPES.get(kind) ?? m.place_sheet_type_none) : PRECISE_TYPES[precise];
};

const typeOf = (place: Typed): string => {
  const type = labelOf(place)();
  const cuisineName = CUISINES.get(place.cuisine);
  return cuisineName === undefined ? type : m.place_sheet_type_with_cuisine({ type, cuisine: cuisineName() });
};

export { typeOf };
