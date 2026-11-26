import { m } from '#i18n/messages';
import type { ClockTime, DayHours, OpenRange, Weekday } from '../../domain/opening-hours';

const MINUTE_DIGITS = 2;

const DAYS: Readonly<Record<Weekday, () => string>> = {
  monday: m.place_sheet_hours_monday,
  tuesday: m.place_sheet_hours_tuesday,
  wednesday: m.place_sheet_hours_wednesday,
  thursday: m.place_sheet_hours_thursday,
  friday: m.place_sheet_hours_friday,
  saturday: m.place_sheet_hours_saturday,
  sunday: m.place_sheet_hours_sunday
};

const clockOf = ({ hour, minute }: ClockTime): string =>
  minute === 0
    ? m.place_sheet_hours_at_hour({ heure: hour })
    : m.place_sheet_hours_at_minute({ heure: hour, minute: String(minute).padStart(MINUTE_DIGITS, '0') });

const rangeOf = ({ from, to }: OpenRange): string => m.place_sheet_hours_range({ from: clockOf(from), to: clockOf(to) });

const hoursOf = (hours: DayHours): string => {
  switch (hours.kind) {
    case 'closed':
      return m.place_sheet_hours_closed();
    case 'all day':
      return m.place_sheet_hours_all_day();
    case 'uncertain':
      return m.place_sheet_hours_uncertain();
    default:
      return hours.ranges.map(rangeOf).reduce((liste, plage) => m.place_sheet_hours_ranges({ liste, plage }));
  }
};

const dayOf = (weekday: Weekday): string => DAYS[weekday]();

export { clockOf, dayOf, hoursOf };
