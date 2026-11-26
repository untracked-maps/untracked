import { m } from '#i18n/messages';
import type { Freshness } from '../../domain/freshness';
import type { Access, GlanceColumn } from '../../domain/glance-at-place';

type Column = Exclude<GlanceColumn, { readonly kind: 'hours' }>;

type Told = {
  readonly label: string;
  readonly value: string;
};

const SHORTEST = 10;

const METRES_UP_TO = 950;

const TENTHS_UP_TO = 9500;

const METRES_PER_KILOMETRE = 1000;

const METRES_PER_TENTH = 100;

const TENTHS_PER_KILOMETRE = 10;

const ACCESS: Readonly<Record<Access, () => string>> = {
  yes: m.place_glance_wheelchair_yes,
  limited: m.place_glance_wheelchair_limited,
  no: m.place_glance_wheelchair_no
};

const distanceOf = (metres: number, locale: string): string => {
  if (metres < METRES_UP_TO) {
    return m.place_glance_metres({ distance: Math.max(SHORTEST, Math.round(metres / SHORTEST) * SHORTEST) });
  }
  const tenths = metres < TENTHS_UP_TO;
  const kilometres = tenths
    ? Math.round(metres / METRES_PER_TENTH) / TENTHS_PER_KILOMETRE
    : Math.round(metres / METRES_PER_KILOMETRE);
  return m.place_glance_kilometres({
    distance: new Intl.NumberFormat(locale, { minimumFractionDigits: tenths ? 1 : 0 }).format(kilometres)
  });
};

const toldOf = (column: Column, locale: string): Told => {
  switch (column.kind) {
    case 'distance':
      return { label: m.place_glance_distance(), value: distanceOf(column.metres, locale) };
    case 'wheelchair':
      return { label: m.place_glance_wheelchair(), value: ACCESS[column.access]() };
    default:
      return {
        label: m.place_glance_entrance(),
        value: column.fee === 'free' ? m.place_glance_entrance_free() : m.place_glance_entrance_paid()
      };
  }
};

const freshnessText = ({ state, checked: { year, month } }: Freshness, locale: string): string =>
  state === 'verified'
    ? m.place_freshness_verified({
        quand: new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
          Date.UTC(year, month - 1)
        )
      })
    : m.place_freshness_not_verified({ quand: year });

export { freshnessText, toldOf };
