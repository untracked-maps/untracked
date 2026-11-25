import { defer, type Observable } from 'rxjs';
import type { Departure } from '../../domain/next-departures';
import type { LoadDepartures, Station } from '../../domain/show-station';
import { type FetchFile, type FileLine, stationFile } from '../prerendered/station-file';

type FakeService = {
  readonly fetchFile: FetchFile;
  readonly urlOf: (id: string) => string;
  readonly now: () => number;
  readonly failingAt: readonly string[];
};

const MINUTE = 60_000;

const GONE_AFTER = 30_000;

const DEPARTURES_PER_DIRECTION = 4;

const DELAY_MINUTES = 2;

const DELAY = DELAY_MINUTES * MINUTE;

const METRO_HEADWAY = 4;

const RER_HEADWAY = 8;

const HEADWAYS: ReadonlyMap<string | undefined, number> = new Map([
  ['subway', METRO_HEADWAY],
  ['RER', RER_HEADWAY]
]);

const TRAIN_HEADWAY = 15;

const headwayOf = ({ tags }: FileLine): number =>
  (HEADWAYS.get(tags['route_master']) ?? HEADWAYS.get(tags['network']) ?? TRAIN_HEADWAY) * MINUTE;

const seedOf = (text: string): number => [...text].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);

const isTransilien = ({ tags }: FileLine): boolean => tags['network'] === 'Transilien';

const isRer = ({ tags }: FileLine): boolean => tags['network'] === 'RER';

const departureOf =
  (line: FileLine, direction: string, start: number, headway: number) =>
  (index: number): Departure => {
    const aimed = start + index * headway;
    const delayed = isRer(line) && index === 1;
    return {
      lineRef: line.id,
      destinationName: direction,
      aimedDepartureTime: new Date(aimed).toISOString(),
      ...(delayed ? { expectedDepartureTime: new Date(aimed + DELAY).toISOString(), departureStatus: 'delayed' } : {}),
      ...(isTransilien(line) && index === 2 ? { departureStatus: 'cancelled' } : {}),
      monitored: !isTransilien(line) || index === 0
    };
  };

const directionDepartures =
  (line: FileLine, now: number) =>
  (direction: string): readonly Departure[] => {
    const headway = headwayOf(line);
    const offset = (seedOf(`${line.id}${direction}`) % (headway / MINUTE)) * MINUTE;
    const start = Math.floor((now - GONE_AFTER - offset) / headway) * headway + offset + headway;
    return Array.from({ length: DEPARTURES_PER_DIRECTION }, (_, index) => index).map(
      departureOf(line, direction, start, headway)
    );
  };

const fakeDeparturesAt = (lines: readonly FileLine[], now: number): readonly Departure[] =>
  lines.flatMap((line) => line.directions.flatMap(directionDepartures(line, now)));

const fakeDepartures =
  ({ fetchFile, urlOf, now, failingAt }: FakeService): LoadDepartures =>
  ({ id }: Station): Observable<readonly Departure[]> =>
    defer(async () => {
      if (failingAt.includes(id)) {
        throw new Error('The fake departures service fails for this station.');
      }
      return fakeDeparturesAt((await stationFile(fetchFile, urlOf(id), id)).lines, now());
    });

export { fakeDepartures };
