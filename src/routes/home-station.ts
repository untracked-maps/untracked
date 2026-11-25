import { map, type Observable, of, Subject } from 'rxjs';
import type { PlaceSheet } from '#features/places/abilities/open-place/domain/open-place';
import { type StationView, showStation } from '#features/places/abilities/show-station/domain/show-station';
import type { Coordinates } from '#features/places/abilities/show-station/domain/station-exits';
import { clock } from '#features/places/abilities/show-station/implementation/browser/clock';
import { pageShown } from '#features/places/abilities/show-station/implementation/browser/page-shown';
import { fakeDepartures } from '#features/places/abilities/show-station/implementation/in-memory/fake-departures';
import { prerenderedStation } from '#features/places/abilities/show-station/implementation/prerendered/prerendered-station';
import { linesServed } from '#features/places/abilities/show-station/ui/components/station.presenter';
import { browser } from '$app/env';
import { resolve } from '$app/paths';

type HomeStation = {
  readonly view: Observable<StationView>;
  readonly lines: Observable<string | undefined>;
  readonly touched: Observable<Coordinates>;
  readonly touch: (at: Coordinates) => void;
};

const urlOf = (id: string): string => resolve('/data/stations/[id].json', { id });

const fetchFile = (url: string): Promise<Response> => fetch(url);

const now = (): number => Date.now();

const stationOpenIn = (sheet: PlaceSheet): string | undefined =>
  sheet.status === 'open' && sheet.place.kind === 'station' ? sheet.place.id : undefined;

const homeStation = (sheet: Observable<PlaceSheet>): HomeStation => {
  const touched = new Subject<Coordinates>();
  const view: Observable<StationView> = browser
    ? showStation({
        loadStation: prerenderedStation(fetchFile, urlOf),
        loadDepartures: fakeDepartures({ fetchFile, urlOf, now, failingAt: [] })
      })({ opened: sheet.pipe(map(stationOpenIn)), time: clock(now), shown: pageShown(document) })
    : of({ status: 'none' });
  return { view, lines: view.pipe(map(linesServed)), touched, touch: (at): void => touched.next(at) };
};

export { type HomeStation, homeStation };
