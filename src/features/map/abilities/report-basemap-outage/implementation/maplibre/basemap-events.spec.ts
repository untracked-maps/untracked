import { ErrorEvent, MapSourceDataEvent } from 'maplibre-gl';
import { firstValueFrom, type Observable } from 'rxjs';
import { describe, expect, it } from 'vitest';
import type { BasemapEvent } from '../../domain/report-basemap-outage';
import { mapLibreBasemapEvents } from './basemap-events';

type MapEvents = Parameters<ReturnType<typeof mapLibreBasemapEvents>['watch']>[0];

type FiredEvent = Parameters<Parameters<MapEvents['on']>[1]>[0];

type FakeMap = MapEvents & {
  readonly fire: (event: FiredEvent) => void;
};

const BASEMAP = 'openmaptiles';

const fakeMap = (): FakeMap => {
  const listeners = new Map<string, (event: FiredEvent) => void>();
  return {
    on: (type, listener) => listeners.set(type, listener),
    off: (type) => listeners.delete(type),
    fire: (event): void => listeners.get(event.type)?.(event)
  };
};

const nextEventOn = (map: FakeMap): Observable<BasemapEvent> => {
  const basemap = mapLibreBasemapEvents(BASEMAP);
  basemap.watch(map);
  return basemap.basemapEvents();
};

const firstEventAfter = (fire: (map: FakeMap) => void): Promise<BasemapEvent> => {
  const map = fakeMap();
  const event = firstValueFrom(nextEventOn(map));
  fire(map);
  return event;
};

const tileFailed = (sourceId: string): ErrorEvent => new ErrorEvent(new Error('refused'), { sourceId, tile: {} });
const tileLoaded = (sourceId: string): MapSourceDataEvent => new MapSourceDataEvent('sourcedata', { sourceId, tile: {} });

describe('basemap events of MapLibre', () => {
  it('reports a tile of the basemap that failed', async () => {
    expect(await firstEventAfter((map) => map.fire(tileFailed(BASEMAP)))).toBe('tile-failed');
  });

  it('reports a basemap source that failed without any tile', async () => {
    const sourceFailed = new ErrorEvent(new Error('refused'), { sourceId: BASEMAP });

    expect(await firstEventAfter((map) => map.fire(sourceFailed))).toBe('source-failed');
  });

  it('reports a tile of the basemap that loaded', async () => {
    expect(await firstEventAfter((map) => map.fire(tileLoaded(BASEMAP)))).toBe('tile-loaded');
  });

  it('ignores the failures of other sources', async () => {
    const firstEvent = firstEventAfter((map) => {
      map.fire(tileFailed('elsewhere'));
      map.fire(tileLoaded(BASEMAP));
    });

    expect(await firstEvent).toBe('tile-loaded');
  });

  it('ignores the tiles other sources load', async () => {
    const firstEvent = firstEventAfter((map) => {
      map.fire(tileLoaded('elsewhere'));
      map.fire(tileFailed(BASEMAP));
    });

    expect(await firstEvent).toBe('tile-failed');
  });

  it('ignores basemap data that is not a tile', async () => {
    const firstEvent = firstEventAfter((map) => {
      map.fire(new MapSourceDataEvent('sourcedata', { sourceId: BASEMAP, sourceDataType: 'metadata' }));
      map.fire(tileFailed(BASEMAP));
    });

    expect(await firstEvent).toBe('tile-failed');
  });
});
