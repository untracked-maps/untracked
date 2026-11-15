import { filter, fromEvent, map, merge, type Observable, ReplaySubject, switchMap } from 'rxjs';
import type { BasemapEvent, BasemapEvents } from '../../domain/report-basemap-outage';

type SourceEvent = {
  readonly type: string;
  readonly sourceId?: string;
  readonly tile?: unknown;
};

type SourceEventListener = (event: SourceEvent) => void;

type MapEvents = {
  readonly on: (type: string, listener: SourceEventListener) => unknown;
  readonly off: (type: string, listener: SourceEventListener) => unknown;
};

type MapLibreBasemapEvents = {
  readonly watch: (map: MapEvents) => void;
  readonly basemapEvents: BasemapEvents;
};

const hasTile = ({ tile }: SourceEvent): boolean => tile !== undefined;

const failureOf = (event: SourceEvent): BasemapEvent => (hasTile(event) ? 'tile-failed' : 'source-failed');

const basemapEventsOf =
  (sourceId: string) =>
  (target: MapEvents): Observable<BasemapEvent> => {
    const fromBasemap = (type: string): Observable<SourceEvent> =>
      fromEvent<SourceEvent>(target, type).pipe(filter((event) => event.sourceId === sourceId));
    return merge(
      fromBasemap('error').pipe(map(failureOf)),
      fromBasemap('sourcedata').pipe(
        filter(hasTile),
        map(() => 'tile-loaded' as const)
      )
    );
  };

const mapLibreBasemapEvents = (sourceId: string): MapLibreBasemapEvents => {
  const maps$ = new ReplaySubject<MapEvents>(1);
  return {
    watch: (target): void => maps$.next(target),
    basemapEvents: () => maps$.pipe(switchMap(basemapEventsOf(sourceId)))
  };
};

export { mapLibreBasemapEvents };
