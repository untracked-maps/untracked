import { catchError, distinctUntilChanged, map, type Observable, of, shareReplay, startWith, switchMap } from 'rxjs';
import { expectsHours } from '../../../domain/expects-hours';
import type { OpeningStatus, OsmOpeningHours, WeekDay, Where } from './opening-hours';

type HoursPlace = {
  readonly id: string;
  readonly kind?: string;
  readonly openingHours?: string;
  readonly where: Where;
};

type HoursReader = {
  readonly readOpeningHours: (value: string, where: Where) => OsmOpeningHours | undefined;
  readonly statusAt: (hours: OsmOpeningHours, time: number) => OpeningStatus;
  readonly weekAt: (hours: OsmOpeningHours, time: number) => readonly WeekDay[];
};

type LoadHoursReader = () => Observable<HoursReader>;

type ShowOpeningHoursPorts = {
  readonly loadHoursReader: LoadHoursReader;
};

type ShowOpeningHoursInputs = {
  readonly opened: Observable<HoursPlace | undefined>;
  readonly time: Observable<number>;
};

type HoursView =
  | { readonly status: 'none' }
  | { readonly status: 'unknown' }
  | { readonly status: 'unreadable' }
  | { readonly status: 'known'; readonly week: readonly WeekDay[]; readonly now: OpeningStatus };

const MINUTE = 60_000;

const NONE: HoursView = { status: 'none' };

const UNKNOWN: HoursView = { status: 'unknown' };

const UNREADABLE: HoursView = { status: 'unreadable' };

const minuteOf = (time: number): number => Math.floor(time / MINUTE) * MINUTE;

const sameId = (previous: HoursPlace | undefined, next: HoursPlace | undefined): boolean => previous?.id === next?.id;

const knownHours = (reader: HoursReader, hours: OsmOpeningHours, time: Observable<number>): Observable<HoursView> =>
  time.pipe(
    map(minuteOf),
    distinctUntilChanged(),
    map((now) => ({ status: 'known', week: reader.weekAt(hours, now), now: reader.statusAt(hours, now) }))
  );

const readHours =
  (place: HoursPlace, value: string, time: Observable<number>) =>
  (reader: HoursReader): Observable<HoursView> => {
    const hours = reader.readOpeningHours(value, place.where);
    return hours === undefined ? of(UNREADABLE) : knownHours(reader, hours, time);
  };

const hoursOf =
  ({ loadHoursReader }: ShowOpeningHoursPorts, time: Observable<number>) =>
  (place: HoursPlace | undefined): Observable<HoursView> => {
    if (place === undefined) {
      return of(NONE);
    }
    const value = place.openingHours;
    if (value === undefined) {
      return of(expectsHours(place.kind) ? UNKNOWN : NONE);
    }
    return loadHoursReader().pipe(
      switchMap(readHours(place, value, time)),
      catchError(() => of(NONE))
    );
  };

const showOpeningHours =
  (ports: ShowOpeningHoursPorts) =>
  ({ opened, time }: ShowOpeningHoursInputs): Observable<HoursView> =>
    opened.pipe(
      distinctUntilChanged(sameId),
      switchMap(hoursOf(ports, time)),
      startWith(NONE),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true })
    );

export { type HoursPlace, type HoursReader, type HoursView, type LoadHoursReader, showOpeningHours };
