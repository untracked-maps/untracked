import { LngLat, Map as MapLibreMap, type StyleSpecification, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { BehaviorSubject, type Observable } from 'rxjs';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { page } from 'vitest/browser';
import type { Place } from '../../../../domain/place';
import type { KindSearch } from '../../domain/search-by-type';
import { kindPlacesOverlay } from './kind-places-overlay';

const GARCIA: Place = {
  id: 'boulangerie-garcia',
  name: 'Boulangerie Garcia',
  kind: 'bakery',
  address: { houseNumber: '97', street: 'Rue de Paris', postalCode: '75019', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: { longitude: 2.34, latitude: 48.85 },
  fame: 0
};

const NOEL: Place = {
  ...GARCIA,
  id: 'boulangerie-noel',
  name: 'Boulangerie Noel',
  coordinates: { longitude: 2.36, latitude: 48.87 }
};

const FOUND: KindSearch = { status: 'found', placeKind: 'bakery', places: [GARCIA, NOEL] };

const EMPTY_STYLE: StyleSpecification = { version: 8, sources: {}, layers: [] };

const MAP_SIZE = 'inline-size: 400px; block-size: 600px';

const mapAt = (zoom: number): MapLibreMap => {
  const container = document.body.appendChild(document.createElement('div'));
  container.setAttribute('style', MAP_SIZE);
  setWorkerUrl(workerUrl);
  const map = new MapLibreMap({ container, style: EMPTY_STYLE, center: [2.2, 48.7], zoom });
  onTestFinished(() => {
    map.remove();
    container.remove();
  });
  return map;
};

const drawn = (overlay$: Observable<unknown>): void => {
  const subscription = overlay$.subscribe();
  onTestFinished(() => subscription.unsubscribe());
};

const shows = (map: MapLibreMap, { coordinates: { longitude, latitude } }: Place): boolean =>
  map.getBounds().contains(new LngLat(longitude, latitude));

describe('places of a kind on the map', () => {
  it('are marked by name', async () => {
    drawn(kindPlacesOverlay(new BehaviorSubject<KindSearch>(FOUND))(mapAt(13)));

    await expect.element(page.getByRole('img', { name: 'Boulangerie Noel' })).toBeVisible();
  });

  it('are marked in the colour of their kind', async () => {
    drawn(kindPlacesOverlay(new BehaviorSubject<KindSearch>(FOUND))(mapAt(13)));

    await expect.element(page.getByRole('img', { name: 'Boulangerie Garcia' })).toHaveAttribute('data-kind', 'bakery');
  });

  it('are all shown, the map fitting them', async () => {
    const map = mapAt(16);

    drawn(kindPlacesOverlay(new BehaviorSubject<KindSearch>(FOUND))(map));

    await expect.poll(() => shows(map, GARCIA) && shows(map, NOEL), { timeout: 5000 }).toBe(true);
  });

  it('are not shown from closer than the street', async () => {
    const map = mapAt(10);

    drawn(kindPlacesOverlay(new BehaviorSubject<KindSearch>({ ...FOUND, places: [GARCIA] }))(map));

    await expect.poll(() => (shows(map, GARCIA) ? map.getZoom() : undefined), { timeout: 5000 }).toBe(16);
  });

  it('are unmarked once the search is closed', async () => {
    const search = new BehaviorSubject<KindSearch>(FOUND);
    drawn(kindPlacesOverlay(search)(mapAt(13)));
    await vi.waitFor(() => page.getByRole('img', { name: 'Boulangerie Garcia' }).element());

    search.next({ status: 'closed' });

    await expect.element(page.getByRole('img', { name: 'Boulangerie Garcia' })).not.toBeInTheDocument();
  });

  it('move nothing while searching', () => {
    const map = mapAt(13);

    drawn(kindPlacesOverlay(new BehaviorSubject<KindSearch>({ status: 'searching', placeKind: 'bakery' }))(map));

    expect(map.isMoving()).toBe(false);
  });
});
