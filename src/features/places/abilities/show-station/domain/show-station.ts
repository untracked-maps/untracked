import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  map,
  type Observable,
  of,
  scan,
  shareReplay,
  startWith,
  switchMap
} from 'rxjs';
import { type Departure, type Line, type LineDepartures, nextDepartures } from './next-departures';
import { type Exit, type StationExit, stationExits } from './station-exits';

type Station = {
  readonly id: string;
  readonly lines: readonly Line[];
  readonly exits: readonly Exit[];
};

type LoadStation = (id: string) => Observable<Station>;

type LoadDepartures = (station: Station) => Observable<readonly Departure[]>;

type ShowStationPorts = {
  readonly loadStation: LoadStation;
  readonly loadDepartures: LoadDepartures;
};

type ShowStationInputs = {
  readonly opened: Observable<string | undefined>;
  readonly time: Observable<number>;
  readonly shown: Observable<boolean>;
};

type StationDepartures =
  | { readonly status: 'asked' }
  | { readonly status: 'unavailable' }
  | { readonly status: 'known'; readonly lines: readonly LineDepartures[] };

type StationView =
  | { readonly status: 'none' }
  | {
      readonly status: 'open';
      readonly id: string;
      readonly exits: readonly StationExit[];
      readonly departures: StationDepartures;
    };

type Answer = { readonly departures: readonly Departure[] } | undefined;

const ASKED_EVERY = 30_000;

const COUNTED_EVERY = 10_000;

const NONE: StationView = { status: 'none' };

const paced =
  (period: number) =>
  (time$: Observable<number>): Observable<number> =>
    time$.pipe(
      scan((last, now) => (now >= last + period ? now : last), Number.NEGATIVE_INFINITY),
      distinctUntilChanged()
    );

const asked = (loadDepartures: LoadDepartures, station: Station): Observable<Answer> =>
  loadDepartures(station).pipe(
    map((departures) => ({ departures })),
    catchError(() => of(undefined))
  );

const answers = (
  { loadDepartures }: ShowStationPorts,
  { time, shown }: ShowStationInputs,
  station: Station
): Observable<Answer | 'asked'> =>
  shown.pipe(
    distinctUntilChanged(),
    switchMap((visible: boolean) =>
      visible
        ? time.pipe(
            paced(ASKED_EVERY),
            switchMap(() => asked(loadDepartures, station))
          )
        : EMPTY
    ),
    startWith<Answer | 'asked'>('asked')
  );

const departuresOf = (station: Station, answer: Answer | 'asked', now: number): StationDepartures => {
  if (answer === 'asked') {
    return { status: 'asked' };
  }
  return answer === undefined
    ? { status: 'unavailable' }
    : { status: 'known', lines: nextDepartures(station.lines, answer.departures, now) };
};

const viewOf =
  (ports: ShowStationPorts, inputs: ShowStationInputs) =>
  (station: Station): Observable<StationView> => {
    const exits = stationExits(station.exits);
    return combineLatest([answers(ports, inputs, station), inputs.time.pipe(paced(COUNTED_EVERY))]).pipe(
      map(([answer, now]) => ({ status: 'open', id: station.id, exits, departures: departuresOf(station, answer, now) }))
    );
  };

const showStation =
  (ports: ShowStationPorts) =>
  (inputs: ShowStationInputs): Observable<StationView> =>
    inputs.opened.pipe(
      distinctUntilChanged(),
      switchMap((id) =>
        id === undefined
          ? of(NONE)
          : ports.loadStation(id).pipe(
              switchMap(viewOf(ports, inputs)),
              catchError(() => of(NONE))
            )
      ),
      startWith(NONE),
      shareReplay({ bufferSize: 1, refCount: true })
    );

export { type LoadDepartures, type LoadStation, type Station, type StationView, showStation };
