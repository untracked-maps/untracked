import { m } from '#i18n/messages';
import type { SheetPlace } from '../../domain/open-place';

type Typed = Pick<SheetPlace, 'kind' | 'cuisine'>;

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
  ['station', m.place_sheet_type_station]
]);

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

const typeOf = ({ kind, cuisine }: Typed): string => {
  const type = (TYPES.get(kind) ?? m.place_sheet_type_none)();
  const cuisineName = CUISINES.get(cuisine);
  return cuisineName === undefined ? type : m.place_sheet_type_with_cuisine({ type, cuisine: cuisineName() });
};

export { typeOf };
