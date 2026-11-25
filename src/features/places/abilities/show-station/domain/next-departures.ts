import { type Colours, readableColours } from './readable-colours';

type Tags = Readonly<Partial<Record<string, string>>>;

type Line = {
  readonly id: string;
  readonly tags: Tags;
};

type DepartureStatus = 'onTime' | 'early' | 'delayed' | 'cancelled' | 'arrived' | 'departed' | 'missed' | 'noReport';

type Departure = {
  readonly lineRef: string;
  readonly destinationName: string;
  readonly aimedDepartureTime: string;
  readonly expectedDepartureTime?: string;
  readonly monitored: boolean;
  readonly departureStatus?: DepartureStatus;
};

type Mode = 'subway' | 'train' | 'tram';

type Told =
  | { readonly told: 'at platform' }
  | { readonly told: 'minutes'; readonly minutes: number }
  | { readonly told: 'time'; readonly at: string };

type LineDepartures = Colours & {
  readonly ref: string;
  readonly mode: Mode;
  readonly network?: string;
  readonly destination: string;
  readonly times: readonly Told[];
  readonly live: boolean;
};

type Kept = {
  readonly line: Line & { readonly mode: Mode };
  readonly departure: Departure;
  readonly at: number;
};

const MINUTE = 60_000;

const GONE_AFTER = 30_000;

const TIMES_PER_LINE = 3;

const LINES_AT_MOST = 12;

const MODES: ReadonlyMap<string | undefined, Mode> = new Map<string | undefined, Mode>([
  ['subway', 'subway'],
  ['train', 'train'],
  ['light_rail', 'train'],
  ['tram', 'tram']
]);

const MODE_ORDER: readonly Mode[] = ['subway', 'train', 'tram'];

const REFS = new Intl.Collator('en', { numeric: true });

const timeOf = ({ expectedDepartureTime, aimedDepartureTime }: Departure): number =>
  Date.parse(expectedDepartureTime ?? aimedDepartureTime);

const toldAt = (now: number, departure: Departure): Told => {
  const minutes = Math.round((timeOf(departure) - now) / MINUTE);
  if (minutes <= 0) {
    return { told: 'at platform' };
  }
  return minutes < 60
    ? { told: 'minutes', minutes }
    : { told: 'time', at: departure.expectedDepartureTime ?? departure.aimedDepartureTime };
};

const railOf =
  (lines: readonly Line[]) =>
  (departure: Departure): readonly Kept[] => {
    const line = lines.find(({ id }) => id === departure.lineRef);
    const mode = MODES.get(line?.tags['route_master']);
    return line === undefined || mode === undefined ? [] : [{ line: { ...line, mode }, departure, at: timeOf(departure) }];
  };

type Group = {
  readonly first: Kept;
  readonly all: readonly Kept[];
};

const keyOf = ({ line, departure }: Kept): string => `${line.id}|${departure.destinationName}`;

const groupsOf = (kept: readonly Kept[]): readonly Group[] =>
  kept
    .filter((one, index) => kept.findIndex((other) => keyOf(other) === keyOf(one)) === index)
    .map((first) => ({ first, all: kept.filter((one) => keyOf(one) === keyOf(first)) }));

const byTime = (one: Kept, other: Kept): number => one.at - other.at;

const refOf = ({ first }: Group): string => first.line.tags['ref'] ?? '';

const modeRankOf = ({ first }: Group): number => MODE_ORDER.indexOf(first.line.mode);

const byLine = (one: Group, other: Group): number =>
  modeRankOf(one) - modeRankOf(other) || REFS.compare(refOf(one), refOf(other));

const networkOf = (tags: Tags): Pick<LineDepartures, 'network'> => {
  const network = tags['network'];
  return network === undefined ? {} : { network };
};

const shownLine =
  (now: number) =>
  ({ first: { line, departure }, all }: Group): LineDepartures => {
    const shown = all.slice(0, TIMES_PER_LINE);
    return {
      ref: line.tags['ref'] ?? '',
      mode: line.mode,
      ...networkOf(line.tags),
      destination: departure.destinationName,
      ...readableColours({ colour: line.tags['colour'], textColour: line.tags['text_colour'] }),
      times: shown.map((one) => toldAt(now, one.departure)),
      live: shown.some((one) => one.departure.monitored)
    };
  };

const isWaited =
  (now: number) =>
  ({ departure, at }: Kept): boolean =>
    departure.departureStatus !== 'cancelled' && at >= now - GONE_AFTER;

const nextDepartures = (lines: readonly Line[], departures: readonly Departure[], now: number): readonly LineDepartures[] =>
  groupsOf(departures.flatMap(railOf(lines)).filter(isWaited(now)).toSorted(byTime))
    .toSorted(byLine)
    .slice(0, LINES_AT_MOST)
    .map(shownLine(now));

export { type Departure, type Line, type LineDepartures, nextDepartures, type Tags, type Told };
