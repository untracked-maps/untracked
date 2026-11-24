import { m } from '#i18n/messages';
import type { Fact } from '../../domain/good-to-know';

type Label = () => string;

const LABELS: Readonly<Record<Fact, Label>> = {
  'historic-monument': m.place_sheet_fact_historic_monument,
  contactless: m.place_sheet_fact_contactless,
  'cards-accepted': m.place_sheet_fact_cards_accepted,
  'cards-refused': m.place_sheet_fact_cards_refused,
  'cash-refused': m.place_sheet_fact_cash_refused,
  'meal-vouchers': m.place_sheet_fact_meal_vouchers,
  terrace: m.place_sheet_fact_terrace,
  'vegan-only': m.place_sheet_fact_vegan_only,
  'vegetarian-only': m.place_sheet_fact_vegetarian_only,
  'vegan-options': m.place_sheet_fact_vegan_options,
  'vegetarian-options': m.place_sheet_fact_vegetarian_options,
  'gluten-free': m.place_sheet_fact_gluten_free,
  'takeaway-only': m.place_sheet_fact_takeaway_only,
  takeaway: m.place_sheet_fact_takeaway,
  delivery: m.place_sheet_fact_delivery,
  'reservation-required': m.place_sheet_fact_reservation_required,
  'reservation-recommended': m.place_sheet_fact_reservation_recommended,
  'reservation-possible': m.place_sheet_fact_reservation_possible,
  'no-reservation': m.place_sheet_fact_no_reservation,
  'free-wifi': m.place_sheet_fact_free_wifi,
  wifi: m.place_sheet_fact_wifi,
  'air-conditioned': m.place_sheet_fact_air_conditioned,
  'accessible-toilets': m.place_sheet_fact_accessible_toilets,
  toilets: m.place_sheet_fact_toilets,
  'changing-table': m.place_sheet_fact_changing_table,
  'dogs-welcome': m.place_sheet_fact_dogs_welcome,
  'dogs-on-a-leash': m.place_sheet_fact_dogs_on_a_leash,
  'dogs-not-allowed': m.place_sheet_fact_dogs_not_allowed,
  'self-service': m.place_sheet_fact_self_service,
  'second-hand': m.place_sheet_fact_second_hand,
  'organic-only': m.place_sheet_fact_organic_only,
  'organic-products': m.place_sheet_fact_organic_products
};

const labelOf = (fact: Fact): string => LABELS[fact]();

export { labelOf };
