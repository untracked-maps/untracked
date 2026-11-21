import { type GeoJSONSource, Map as MapLibreMap, type StyleSpecification, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { BehaviorSubject, type Observable, of, type Subscription } from 'rxjs';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { type Place, type PlaceDot, showPlaces } from '../../domain/show-places';
import { placeDotsOverlay } from './place-dots-overlay';

const EIFFEL: Place = {
  id: 'tour-eiffel',
  name: 'Tour Eiffel',
  kind: 'attraction',
  family: 'sight',
  coordinates: { longitude: 2.294_48, latitude: 48.858_26 },
  minzoom: 11.5,
  rank: 0
};

const CAMILLE: Place = { ...EIFFEL, name: 'Chez Camille', kind: 'restaurant', family: 'food', minzoom: 16.5, rank: 199 };

type Dot = {
  readonly properties: { readonly name: string };
};

const STYLE: StyleSpecification = {
  version: 8,
  glyphs: 'https://example.org/{fontstack}/{range}.pbf',
  sources: { points: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } } },
  layers: [
    { id: 'land', type: 'background' },
    { id: 'labels', type: 'symbol', source: 'points', layout: { 'text-field': 'label' } }
  ]
};

const OTHER_STYLE: StyleSpecification = { ...STYLE, layers: [{ id: 'water', type: 'background' }, ...STYLE.layers] };

const shownPlaces = (zoom$: Observable<number>): Observable<readonly PlaceDot[]> =>
  showPlaces({ loadPlaces: (): Observable<readonly Place[]> => of([EIFFEL, CAMILLE]) })(zoom$, of(undefined));

const mapOn = (style?: StyleSpecification): MapLibreMap => {
  setWorkerUrl(workerUrl);
  const container = document.body.appendChild(document.createElement('div'));
  container.setAttribute('style', 'inline-size: 200px; block-size: 200px');
  const map = new MapLibreMap({ container, center: [2.2945, 48.8583], zoom: 12, ...(style === undefined ? {} : { style }) });
  onTestFinished(() => {
    map.remove();
    container.remove();
  });
  return map;
};

const loadedMap = async (): Promise<MapLibreMap> => {
  const map = mapOn(STYLE);
  await map.once('load');
  return map;
};

const drawnOn = (map: MapLibreMap, palette: Observable<'light' | 'dark'> = of('light')): Subscription => {
  const subscription = placeDotsOverlay(shownPlaces, palette)(map).subscribe();
  onTestFinished(() => subscription.unsubscribe());
  return subscription;
};

const namesOn = async (map: MapLibreMap): Promise<readonly unknown[]> => {
  const data = await map.getSource<GeoJSONSource>('place-dots')?.getData();
  return data?.type === 'FeatureCollection' ? data.features.map((feature: Dot) => feature.properties.name) : [];
};

const placesShown = (map: MapLibreMap): Promise<void> =>
  vi.waitFor(async () => {
    if ((await namesOn(map)).length === 0) {
      throw new Error('No place is shown yet.');
    }
  });

const restyle = async (map: MapLibreMap): Promise<void> => {
  const restyled = map.once('style.load');
  map.setStyle(OTHER_STYLE);
  await restyled;
};

describe('place dots overlay', () => {
  it('draws the dots above the labels of the map, the places without a family underneath', async () => {
    const map = await loadedMap();

    drawnOn(map);

    await expect.poll(() => map.getLayersOrder()).toStrictEqual(['land', 'labels', 'place-dots-without-family', 'place-dots']);
  });

  it('shows the places that show at the zoom of the map', async () => {
    const map = await loadedMap();

    drawnOn(map);

    await expect.poll(() => namesOn(map)).toStrictEqual(['Tour Eiffel']);
  });

  it('shows more places as the map zooms in', async () => {
    const map = await loadedMap();
    drawnOn(map);
    await placesShown(map);

    map.setZoom(16.5);

    await expect.poll(() => namesOn(map)).toStrictEqual(['Tour Eiffel', 'Chez Camille']);
  });

  it('keeps the places shown when the palette changes', async () => {
    const map = await loadedMap();
    const palette = new BehaviorSubject<'light' | 'dark'>('dark');
    drawnOn(map, palette);
    await placesShown(map);

    palette.next('light');

    await expect.poll(() => namesOn(map)).toStrictEqual(['Tour Eiffel']);
  });

  it('writes the names over the halo of a palette that changes while the map changes its style', async () => {
    const map = await loadedMap();
    const palette = new BehaviorSubject<'light' | 'dark'>('light');
    drawnOn(map, palette);
    await placesShown(map);

    map.setStyle(OTHER_STYLE, { diff: false });
    palette.next('dark');

    await expect.poll(() => map.getPaintProperty('place-dots', 'text-halo-color')).toBe('rgba(22,24,28,0.9)');
  });

  it('draws the dots once the style of the map has loaded', async () => {
    const map = mapOn(STYLE);
    drawnOn(map);

    await map.once('load');

    await expect.poll(() => namesOn(map)).toStrictEqual(['Tour Eiffel']);
  });

  it('draws the dots again when the map changes its style', async () => {
    const map = await loadedMap();
    drawnOn(map);
    await placesShown(map);

    await restyle(map);

    expect(map.getLayersOrder()).toStrictEqual(['water', 'land', 'labels', 'place-dots-without-family', 'place-dots']);
  });

  it('shows the places again when the map changes its style', async () => {
    const map = await loadedMap();
    drawnOn(map);
    await placesShown(map);

    await restyle(map);

    await expect.poll(() => namesOn(map)).toStrictEqual(['Tour Eiffel']);
  });
});

describe('place dots overlay, once it stops', () => {
  it('removes its layers', async () => {
    const map = await loadedMap();
    const drawing = drawnOn(map);
    await placesShown(map);

    drawing.unsubscribe();

    expect(map.getLayersOrder()).toStrictEqual(['land', 'labels']);
  });

  it('removes its source', async () => {
    const map = await loadedMap();
    const drawing = drawnOn(map);
    await placesShown(map);

    drawing.unsubscribe();

    expect(map.getSource('place-dots')).toBeUndefined();
  });

  it('no longer draws its layers on a new style', async () => {
    const map = await loadedMap();
    const drawing = drawnOn(map);
    await placesShown(map);
    drawing.unsubscribe();

    await restyle(map);

    expect(map.getLayersOrder()).toStrictEqual(['water', 'land', 'labels']);
  });

  it('stops without a word on a map that never had a style', async () => {
    const drawing = drawnOn(mapOn());
    await import('./place-dots-on-map');

    expect(() => drawing.unsubscribe()).not.toThrow();
  });
});
