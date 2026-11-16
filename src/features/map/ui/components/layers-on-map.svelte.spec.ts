import { Map as MapLibreMap, type StyleSpecification, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { BehaviorSubject, firstValueFrom, type Observable, of, type Subscription, timer } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { layersOverlay } from './layers-on-map';

type MapLayers = Awaited<ReturnType<Parameters<typeof layersOverlay>[1]>>;

const NO_FEATURES = { type: 'FeatureCollection', features: [] } as const;

const STYLE: StyleSpecification = {
  version: 8,
  sources: { points: { type: 'geojson', data: NO_FEATURES } },
  layers: [
    { id: 'land', type: 'background' },
    { id: 'labels', type: 'symbol', source: 'points', layout: { 'icon-image': 'pin' } }
  ]
};

const OTHER_STYLE: StyleSpecification = { ...STYLE, layers: [{ id: 'water', type: 'background' }, ...STYLE.layers] };

const DRAWN: MapLayers = {
  sources: { lines: { type: 'geojson', data: NO_FEATURES } },
  layers: [{ id: 'lines', type: 'line', source: 'lines' }]
};

const mapOn = (style?: StyleSpecification): MapLibreMap => {
  setWorkerUrl(workerUrl);
  const container = document.createElement('div');
  container.style.inlineSize = '200px';
  container.style.blockSize = '200px';
  document.body.append(container);
  return new MapLibreMap(style === undefined ? { container } : { container, style });
};

const loadedMap = async (): Promise<MapLibreMap> => {
  const map = mapOn(STYLE);
  await map.once('load');
  return map;
};

const layerIds = (map: MapLibreMap): readonly string[] => map.getLayersOrder();

const drawnLayers = async (): Promise<MapLayers> => DRAWN;

const settled = (): Promise<0> => firstValueFrom(timer(0));

const drawnOn = async (map: MapLibreMap, drawn: Observable<boolean | undefined> = of(true)): Promise<Subscription> => {
  const subscription = layersOverlay(drawn, drawnLayers)(map).subscribe();
  await settled();
  return subscription;
};

const restyle = async (map: MapLibreMap): Promise<void> => {
  const restyled = map.once('style.load');
  map.setStyle(OTHER_STYLE);
  await restyled;
};

describe('layers overlay', () => {
  it('draws its layers once the style has loaded', async () => {
    const map = mapOn(STYLE);
    await drawnOn(map);

    await map.once('load');

    expect(layerIds(map)).toContain('lines');
  });

  it('draws its layers at once on a map whose style has loaded', async () => {
    const map = await loadedMap();

    await drawnOn(map);

    expect(layerIds(map)).toContain('lines');
  });

  it('draws its layers under the first label', async () => {
    const map = await loadedMap();

    await drawnOn(map);

    expect(layerIds(map)).toStrictEqual(['land', 'lines', 'labels']);
  });

  it('draws nothing while there is nothing to draw', async () => {
    const map = await loadedMap();

    await drawnOn(map, of(undefined));

    expect(layerIds(map)).toStrictEqual(['land', 'labels']);
  });

  it('draws its layers again when the map changes its style', async () => {
    const map = await loadedMap();
    await drawnOn(map);

    await restyle(map);

    expect(layerIds(map)).toStrictEqual(['water', 'land', 'lines', 'labels']);
  });
});

describe('layers overlay, once it stops', () => {
  it('removes its layers once it stops', async () => {
    const map = await loadedMap();
    const drawing = await drawnOn(map);

    drawing.unsubscribe();

    expect(layerIds(map)).toStrictEqual(['land', 'labels']);
  });

  it('removes its sources once it stops', async () => {
    const map = await loadedMap();
    const drawing = await drawnOn(map);

    drawing.unsubscribe();

    expect(map.getSource('lines')).toBeUndefined();
  });

  it('removes its layers once there is nothing more to draw', async () => {
    const map = await loadedMap();
    const drawn = new BehaviorSubject<boolean | undefined>(true);
    await drawnOn(map, drawn);

    drawn.next(undefined);

    expect(layerIds(map)).toStrictEqual(['land', 'labels']);
  });

  it('no longer draws its layers on a new style once it stops', async () => {
    const map = await loadedMap();
    (await drawnOn(map)).unsubscribe();

    await restyle(map);

    expect(layerIds(map)).toStrictEqual(['water', 'land', 'labels']);
  });
});

describe('layers overlay, on a map without a style', () => {
  it('waits on a map without a style', async () => {
    const map = mapOn();
    const drawing = await drawnOn(map);

    expect(() => drawing.unsubscribe()).not.toThrow();
  });
});
