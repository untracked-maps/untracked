import { LngLat, Map as MapLibreMap, type StyleSpecification, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { EMPTY, type Observable, of } from 'rxjs';
import { describe, expect, it, onTestFinished } from 'vitest';
import { page } from 'vitest/browser';
import type { FramingInputs } from '../../domain/frame-map';
import { framingOverlay } from './framing-overlay';

const LOUVRE = new LngLat(2.337_64, 48.860_61);

const ORSAY = new LngLat(2.326_56, 48.86);

const EMPTY_STYLE: StyleSpecification = { version: 8, sources: {}, layers: [] };

const covering = (attribute: string, style: string): HTMLElement => {
  const element = document.createElement('div');
  element.setAttribute(attribute, '');
  element.style.cssText = style;
  document.body.append(element);
  onTestFinished(() => element.remove());
  return element;
};

const topBar = (): HTMLElement => covering('data-sheet-top', 'position: fixed; inset-block-start: 0; block-size: 72px');

const bottomSheet = (): HTMLElement => covering('data-sheet-open', '--sheet-height: 368px');

const sidePanel = (): HTMLElement =>
  covering('data-sheet-open', 'position: fixed; inset-inline-start: 12px; inline-size: 400px; block-size: 300px');

const mapAt = (zoom: number): MapLibreMap => {
  setWorkerUrl(workerUrl);
  const container = covering('data-map', 'position: fixed; inset: 0');
  const map = new MapLibreMap({ container, style: EMPTY_STYLE, center: [2.3522, 48.8566], zoom });
  onTestFinished(() => map.remove());
  return map;
};

const drawn = (overlay$: Observable<unknown>): void => {
  const subscription = overlay$.subscribe();
  onTestFinished(() => subscription.unsubscribe());
};

const pixelOf = (map: MapLibreMap, place: LngLat): string => {
  const { x, y } = map.project(place);
  return `${Math.round(x)}, ${Math.round(y)}`;
};

const settled = (map: MapLibreMap, read: () => unknown): unknown => (map.isMoving() ? undefined : read());

const landedAt = (map: MapLibreMap): ReturnType<typeof expect.poll<unknown>> =>
  expect.poll(() => settled(map, () => pixelOf(map, LOUVRE)), { timeout: 5000 });

const showsWithin = (map: MapLibreMap, place: LngLat, top: number, bottom: number): boolean => {
  const { x, y } = map.project(place);
  return x >= 36 && x <= innerWidth - 36 && y >= top && y <= bottom;
};

const AT_LOUVRE = { longitude: LOUVRE.lng, latitude: LOUVRE.lat };

const AT_ORSAY = { longitude: ORSAY.lng, latitude: ORSAY.lat };

const NOTHING_FRAMED: FramingInputs = { placesOpened: EMPTY, districtsOpened: EMPTY, placesListed: EMPTY };

const OPENED: FramingInputs = { ...NOTHING_FRAMED, placesOpened: of(AT_LOUVRE) };

const LISTED: FramingInputs = { ...NOTHING_FRAMED, placesListed: of([AT_LOUVRE, AT_ORSAY] as const) };

describe('the framing of the map', () => {
  it('flies a place to the middle of what the top bar and a bottom sheet leave visible', async () => {
    await page.viewport(390, 844);
    topBar();
    bottomSheet();
    const map = mapAt(13);

    drawn(framingOverlay(OPENED)(map));

    await landedAt(map).toBe('195, 274');
  });

  it('flies a place to the middle of what the top bar and a side panel leave visible', async () => {
    await page.viewport(1280, 800);
    topBar();
    sidePanel();
    const map = mapAt(13);

    drawn(framingOverlay(OPENED)(map));

    await landedAt(map).toBe('846, 436');
  });

  it('measures a sheet that opens with the place, once it knows its height', async () => {
    await page.viewport(390, 844);
    const map = mapAt(13);

    drawn(framingOverlay(OPENED)(map));
    requestAnimationFrame(() => {
      topBar();
      bottomSheet();
    });

    await landedAt(map).toBe('195, 274');
  });

  it('zooms in on the place', async () => {
    await page.viewport(390, 844);
    const map = mapAt(13);

    drawn(framingOverlay(OPENED)(map));

    await expect.poll(() => settled(map, () => map.getZoom()), { timeout: 5000 }).toBe(16.5);
  });

  it('fits several places in what the top bar and the sheet leave visible', async () => {
    await page.viewport(390, 844);
    topBar();
    bottomSheet();
    const map = mapAt(10);

    drawn(framingOverlay(LISTED)(map));

    await expect
      .poll(() => settled(map, () => showsWithin(map, LOUVRE, 96, 844 - 392) && showsWithin(map, ORSAY, 96, 844 - 392)), {
        timeout: 5000
      })
      .toBe(true);
  });

  it('goes no closer than zoom 17 to fit', async () => {
    await page.viewport(390, 844);
    const map = mapAt(10);

    drawn(framingOverlay({ ...NOTHING_FRAMED, placesListed: of([AT_ORSAY] as const) })(map));

    await expect.poll(() => settled(map, () => map.getZoom()), { timeout: 5000 }).toBe(17);
  });

  it('moves nothing before something is framed', () => {
    const map = mapAt(13);

    drawn(framingOverlay(NOTHING_FRAMED)(map));

    expect(map.isMoving()).toBe(false);
  });
});
