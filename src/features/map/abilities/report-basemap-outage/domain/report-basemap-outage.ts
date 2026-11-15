import { distinctUntilChanged, map, type Observable, scan, startWith } from 'rxjs';

type BasemapEvent = 'tile-loaded' | 'tile-failed' | 'source-failed';

type BasemapEvents = () => Observable<BasemapEvent>;

type ReportBasemapOutagePorts = {
  readonly basemapEvents: BasemapEvents;
};

const FAILED_TILES_FOR_AN_OUTAGE = 3;

const FAILURES_AFTER: Readonly<Record<BasemapEvent, (failures: number) => number>> = {
  'tile-loaded': () => 0,
  'tile-failed': (failures) => failures + 1,
  'source-failed': () => FAILED_TILES_FOR_AN_OUTAGE
};

const failuresAfter = (failures: number, event: BasemapEvent): number => FAILURES_AFTER[event](failures);

const isOutage = (failures: number): boolean => failures >= FAILED_TILES_FOR_AN_OUTAGE;

const reportBasemapOutage =
  ({ basemapEvents }: ReportBasemapOutagePorts) =>
  (): Observable<boolean> =>
    basemapEvents().pipe(scan(failuresAfter, 0), map(isOutage), startWith(false), distinctUntilChanged());

export { type BasemapEvent, type BasemapEvents, reportBasemapOutage };
