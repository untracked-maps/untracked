import { type GeoJSONSource, Map as MapLibreMap, type StyleSpecification, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { BehaviorSubject, NEVER, type Observable, Subject } from 'rxjs';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import type { StationView } from '../../domain/show-station';
import type { Coordinates } from '../../domain/station-exits';
import { stationExitsOverlay } from './station-exits-overlay';
import { exitsData } from './station-exits-style';

const AT = { longitude: 2.355, latitude: 48.88 };

const OPEN: StationView = {
  status: 'open',
  id: 'nord',
  exits: [{ ref: '1', coordinates: AT }, { coordinates: AT }],
  departures: { status: 'asked' }
};

const STYLE: StyleSpecification = { version: 8, sources: {}, layers: [{ id: 'land', type: 'background' }] };

const loadedMap = async (zoom = 12): Promise<MapLibreMap> => {
  setWorkerUrl(workerUrl);
  const container = document.body.appendChild(document.createElement('div'));
  container.setAttribute('style', 'inline-size: 200px; block-size: 200px');
  const map = new MapLibreMap({ container, center: [2.35, 48.87], zoom, style: STYLE });
  onTestFinished(() => {
    map.remove();
    container.remove();
  });
  await map.once('load');
  return map;
};

const drawnOn = async (
  map: MapLibreMap,
  station: Observable<StationView>,
  touched: Observable<Coordinates> = NEVER
): Promise<void> => {
  const subscription = stationExitsOverlay(station, touched)(map).subscribe();
  onTestFinished(() => subscription.unsubscribe());
  await vi.waitUntil(() => map.getSource('station-exits') !== undefined);
};

const dataOn = (map: MapLibreMap): unknown => map.getSource<GeoJSONSource>('station-exits')?.serialize().data;

describe('the exits of the open station on the map', () => {
  it('are drawn as circles', async () => {
    const map = await loadedMap();
    await drawnOn(map, new BehaviorSubject(OPEN));
    expect(map.getLayer('station-exits')?.type).toBe('circle');
  });

  it('are those of the station', async () => {
    const map = await loadedMap();
    await drawnOn(map, new BehaviorSubject(OPEN));
    expect(dataOn(map)).toEqual(exitsData(OPEN));
  });

  it('are none when no station is open', async () => {
    const map = await loadedMap();
    await drawnOn(map, new BehaviorSubject<StationView>({ status: 'none' }));
    expect(dataOn(map)).toEqual(exitsData({ status: 'none' }));
  });

  it('are taken off the map once the overlay ends', async () => {
    const map = await loadedMap();
    const subscription = stationExitsOverlay(new BehaviorSubject(OPEN), NEVER)(map).subscribe();
    await new Promise((settled) => {
      setTimeout(settled, 50);
    });
    subscription.unsubscribe();
    expect(map.getSource('station-exits')).toBeUndefined();
  });

  it('are drawn again when the style changes', async () => {
    const map = await loadedMap();
    await drawnOn(map, new BehaviorSubject(OPEN));
    map.setStyle({ ...STYLE, layers: [{ id: 'water', type: 'background' }] }, { diff: false });
    await map.once('style.load');
    expect(map.getLayer('station-exits-numbers')?.type).toBe('symbol');
  });
});

const zoomAfterTouching = async (zoom: number): Promise<number> => {
  const map = await loadedMap(zoom);
  const touched = new Subject<Coordinates>();
  await drawnOn(map, new BehaviorSubject(OPEN), touched);
  const moved = map.once('moveend');
  touched.next(AT);
  await moved;
  return Math.round(map.getZoom());
};

describe('an exit touched', () => {
  it('is shown at zoom 17 from afar', async () => {
    expect(await zoomAfterTouching(12)).toBe(17);
  });

  it('keeps a closer zoom', async () => {
    expect(await zoomAfterTouching(18)).toBe(18);
  });
});
