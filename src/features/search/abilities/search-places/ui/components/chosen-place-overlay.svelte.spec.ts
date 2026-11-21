import { LngLat, Map as MapLibreMap, type StyleSpecification, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { BehaviorSubject, type Observable, Subject } from 'rxjs';
import { describe, expect, it, onTestFinished } from 'vitest';
import { page } from 'vitest/browser';
import type { Found } from '../../../../domain/found';
import type { Place } from '../../../../domain/place';
import { chosenPlaceOverlay } from './chosen-place-overlay';

const ORSAY: Place = {
  id: 'musee-d-orsay',
  name: "Musée d'Orsay",
  kind: 'museum',
  address: {
    street: "rue de la Légion d'Honneur",
    postalCode: '75007',
    addressLocality: 'Paris',
    addressCountry: 'FR'
  },
  coordinates: { longitude: 2.326_56, latitude: 48.86 },
  fame: 90
};

const ORSAY_LNG_LAT = new LngLat(ORSAY.coordinates.longitude, ORSAY.coordinates.latitude);

const FLORE: Place = {
  ...ORSAY,
  id: 'cafe-de-flore',
  name: 'Café de Flore',
  coordinates: { longitude: 2.332_63, latitude: 48.854_04 }
};

const RUE_DU_BAC: Found = {
  id: 'address-75007-1-rue-du-bac',
  name: '1 Rue du Bac',
  kind: 'address',
  address: { postalCode: '75007', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: { longitude: 2.3262, latitude: 48.8585 }
};

const EMPTY_STYLE: StyleSpecification = { version: 8, sources: {}, layers: [] };

const containerOfTheMap = (): HTMLElement => {
  const element = document.createElement('div');
  element.style.inlineSize = '400px';
  element.style.blockSize = '300px';
  document.body.append(element);
  onTestFinished(() => element.remove());
  return element;
};

const mapAt = (zoom: number): MapLibreMap => {
  setWorkerUrl(workerUrl);
  const map = new MapLibreMap({ container: containerOfTheMap(), style: EMPTY_STYLE, center: [2.3522, 48.8566], zoom });
  onTestFinished(() => map.remove());
  return map;
};

const drawn = (overlay$: Observable<unknown>): (() => void) => {
  const subscription = overlay$.subscribe();
  onTestFinished(() => subscription.unsubscribe());
  return (): void => subscription.unsubscribe();
};

describe('chosen place overlay', () => {
  it('marks the chosen address on the map', async () => {
    drawn(chosenPlaceOverlay(new BehaviorSubject<Found>(RUE_DU_BAC))(mapAt(13)));

    await expect.element(page.getByRole('img', { name: '1 Rue du Bac' })).toBeVisible();
  });

  it('leaves the mark of a place to its sheet', async () => {
    drawn(chosenPlaceOverlay(new BehaviorSubject(ORSAY))(mapAt(13)));

    await expect.element(page.getByRole('img', { name: "Musée d'Orsay" })).not.toBeInTheDocument();
  });

  it('marks only the last address chosen', async () => {
    const chosen = new BehaviorSubject<Found>(RUE_DU_BAC);
    drawn(chosenPlaceOverlay(chosen)(mapAt(13)));

    chosen.next(FLORE);

    await expect.element(page.getByRole('img', { name: '1 Rue du Bac' })).not.toBeInTheDocument();
  });

  it('flies to the chosen place', async () => {
    const map = mapAt(13);

    drawn(chosenPlaceOverlay(new BehaviorSubject(ORSAY))(map));

    await expect.poll(() => map.getCenter().distanceTo(ORSAY_LNG_LAT), { timeout: 5000 }).toBeLessThan(1);
  });

  it('zooms in to the street', async () => {
    const map = mapAt(13);

    drawn(chosenPlaceOverlay(new BehaviorSubject(ORSAY))(map));

    await expect.poll(() => map.getZoom(), { timeout: 5000 }).toBe(16.5);
  });

  it('keeps a closer zoom', async () => {
    const map = mapAt(18);

    drawn(chosenPlaceOverlay(new BehaviorSubject(ORSAY))(map));

    await expect
      .poll(() => (map.getCenter().distanceTo(ORSAY_LNG_LAT) < 1 ? map.getZoom() : undefined), { timeout: 5000 })
      .toBe(18);
  });

  it('removes the mark once the map no longer shows it', async () => {
    const remove = drawn(chosenPlaceOverlay(new BehaviorSubject<Found>(RUE_DU_BAC))(mapAt(13)));

    remove();

    await expect.element(page.getByRole('img', { name: '1 Rue du Bac' })).not.toBeInTheDocument();
  });

  it('moves nothing before a place is chosen', () => {
    const map = mapAt(13);

    drawn(chosenPlaceOverlay(new Subject<Place>())(map));

    expect(map.isMoving()).toBe(false);
  });
});
