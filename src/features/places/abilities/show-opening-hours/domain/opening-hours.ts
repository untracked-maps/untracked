import OpeningHours from 'opening_hours';
import { wallClockOf } from './wall-clock';

type Where = {
  readonly coordinates: { readonly longitude: number; readonly latitude: number };
  readonly country?: string;
  readonly timeZone?: string;
};

type Location = NonNullable<ConstructorParameters<typeof OpeningHours>[1]>;

const READ: unique symbol = Symbol('opening hours read by the opening_hours library');

type OsmOpeningHours = {
  readonly [READ]: OpeningHours;
  readonly timeZone: string | undefined;
};

type ClockTime = {
  readonly hour: number;
  readonly minute: number;
};

type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

type Moment =
  | { readonly day: 'today' | 'tonight' | 'tomorrow'; readonly at: ClockTime }
  | { readonly day: 'weekday'; readonly weekday: Weekday; readonly at: ClockTime }
  | { readonly day: 'date'; readonly date: { readonly day: number; readonly month: number } };

type OpeningStatus =
  | { readonly state: 'open'; readonly closes?: Moment }
  | { readonly state: 'closed'; readonly opens?: Moment }
  | { readonly state: 'uncertain' };

type OpenRange = {
  readonly from: ClockTime;
  readonly to: ClockTime;
};

type DayHours =
  | { readonly kind: 'closed' }
  | { readonly kind: 'all day' }
  | { readonly kind: 'uncertain' }
  | { readonly kind: 'open'; readonly ranges: readonly OpenRange[] };

type WeekDay = {
  readonly weekday: Weekday;
  readonly today: boolean;
  readonly hours: DayHours;
};

type Interval = readonly [from: Date, to: Date, unknown: boolean, comment: string | undefined];

const WEEKDAYS: readonly Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const COUNTRY_CODE = 'country_code';

const DAY = 86_400_000;

const NIGHT_ENDS = 6;

const WEEK = 7;

const locationOf = ({ coordinates, country }: Where): Location | undefined =>
  country === undefined
    ? undefined
    : { lat: coordinates.latitude, lon: coordinates.longitude, address: { [COUNTRY_CODE]: country.toLowerCase(), state: '' } };

const evaluated = (value: string, location: Location | undefined, now: Date): OpeningHours => {
  const hours = new OpeningHours(value, location);
  hours.getState(now);
  return hours;
};

const attempted = (read: () => OpeningHours): OpeningHours | undefined => {
  try {
    return read();
  } catch {
    return undefined;
  }
};

const readOpeningHours = (value: string, where: Where, time: number): OsmOpeningHours | undefined => {
  const now = wallClockOf(time, where.timeZone);
  const hours = attempted(() => evaluated(value, locationOf(where), now));
  return hours === undefined ? undefined : { [READ]: hours, timeZone: where.timeZone };
};

const clockTimeOf = (date: Date): ClockTime => ({ hour: date.getHours(), minute: date.getMinutes() });

const weekdayOf = (date: Date): Weekday =>
  WEEKDAYS.reduce<Weekday>((found, weekday, rank) => (rank + 1 === date.getDay() ? weekday : found), 'sunday');

const daysBetween = (from: Date, to: Date): number =>
  (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) - Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) /
  DAY;

const momentOf = (now: Date, at: Date): Moment => {
  const days = daysBetween(now, at);
  if (days === 0) {
    return { day: 'today', at: clockTimeOf(at) };
  }
  if (days === 1) {
    return { day: at.getHours() < NIGHT_ENDS ? 'tonight' : 'tomorrow', at: clockTimeOf(at) };
  }
  return days < WEEK
    ? { day: 'weekday', weekday: weekdayOf(at), at: clockTimeOf(at) }
    : { day: 'date', date: { day: at.getDate(), month: at.getMonth() + 1 } };
};

const statusAt = (hours: OsmOpeningHours, time: number): OpeningStatus => {
  const now = wallClockOf(time, hours.timeZone);
  const read = hours[READ];
  if (read.getUnknown(now)) {
    return { state: 'uncertain' };
  }
  const change = read.getNextChange(now);
  const open = read.getState(now);
  if (change === undefined) {
    return { state: open ? 'open' : 'closed' };
  }
  return open ? { state: 'open', closes: momentOf(now, change) } : { state: 'closed', opens: momentOf(now, change) };
};

const dayAfter = (day: Date, days: number): Date => new Date(day.getFullYear(), day.getMonth(), day.getDate() + days);

const hoursOfDay = (read: OpeningHours, start: Date): DayHours => {
  const end = dayAfter(start, 1);
  const intervals: readonly Interval[] = read.getOpenIntervals(dayAfter(start, -1), dayAfter(start, 2));
  const whole = intervals.find(([from, to]) => from <= start && to >= end);
  if (whole !== undefined) {
    return whole[2] ? { kind: 'uncertain' } : { kind: 'all day' };
  }
  const opened = intervals.filter(([from]) => from >= start && from < end);
  if (opened.some(([, , unknown]) => unknown)) {
    return { kind: 'uncertain' };
  }
  return opened.length === 0
    ? { kind: 'closed' }
    : { kind: 'open', ranges: opened.map(([from, to]) => ({ from: clockTimeOf(from), to: clockTimeOf(to) })) };
};

const weekAt = (hours: OsmOpeningHours, time: number): readonly WeekDay[] => {
  const now = wallClockOf(time, hours.timeZone);
  const today = weekdayOf(now);
  const monday = dayAfter(now, -WEEKDAYS.indexOf(today));
  return WEEKDAYS.map((weekday, rank) => ({
    weekday,
    today: weekday === today,
    hours: hoursOfDay(hours[READ], dayAfter(monday, rank))
  }));
};

export {
  type ClockTime,
  type DayHours,
  type Moment,
  type OpeningStatus,
  type OpenRange,
  type OsmOpeningHours,
  readOpeningHours,
  statusAt,
  type WeekDay,
  type Weekday,
  type Where,
  weekAt
};
