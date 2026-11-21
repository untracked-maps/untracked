import { LngLat, Map as MapLibreMap, type StyleSpecification, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { BehaviorSubject, type Observable, of } from 'rxjs';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { page } from 'vitest/browser';
import type { PlaceSheet, SheetPlace } from '../../domain/open-place';
import { openPlaceOverlay } from './open-place-overlay';

const FLORE: SheetPlace = {
  id: 'flore',
  name: 'Café de Flore',
  kind: 'cafe',
  family: 'cafe',
  coordinates: { longitude: 2.332_63, latitude: 48.854_04 }
};

const VERT_GALANT: SheetPlace = {
  id: 'vert-galant',
  name: 'Square du Vert-Galant',
  coordinates: { longitude: 2.341, latitude: 48.857 }
};

const CASTLE: SheetPlace = { ...VERT_GALANT, id: 'castle', name: 'Château', family: 'castle' };

const CENTRE = new LngLat(2.3522, 48.8566);

const EMPTY_STYLE: StyleSpecification = { version: 8, sources: {}, layers: [] };

const opened = (place: SheetPlace): PlaceSheet => ({ status: 'open', place, from: 'search' });

const shown = (sheet: Observable<PlaceSheet>, palette: 'light' | 'dark' = 'light'): MapLibreMap => {
  const container = Object.assign(document.createElement('div'), { style: 'inline-size: 480px; block-size: 320px' });
  document.body.append(container);
  setWorkerUrl(workerUrl);
  const map = new MapLibreMap({ container, style: EMPTY_STYLE, center: CENTRE, zoom: 15 });
  const overlay = openPlaceOverlay(sheet, of(palette))(map).subscribe();
  onTestFinished(() => {
    overlay.unsubscribe();
    map.remove();
    container.remove();
  });
  return map;
};

const dotOf = (name: string): Element => page.getByRole('img', { name }).element();

describe('the place open on the map', () => {
  it('is marked by a dot named after it', async () => {
    shown(of(opened(FLORE)));

    await expect.element(page.getByRole('img', { name: 'Café de Flore' })).toBeVisible();
  });

  it('is marked by a dot of 44 px, with its white rim and shadow', async () => {
    shown(of(opened(FLORE)));
    await vi.waitFor(() => page.getByRole('img', { name: 'Café de Flore' }).element());

    expect(dotOf('Café de Flore').getBoundingClientRect().width).toBe(44);
  });

  it('is coloured after its family', async () => {
    shown(of(opened(FLORE)));
    await vi.waitFor(() => page.getByRole('img', { name: 'Café de Flore' }).element());

    expect(dotOf('Café de Flore').querySelector('[data-disc]')).toHaveAttribute('fill', '#E8742F');
  });

  it('is grey without a family', async () => {
    shown(of(opened(VERT_GALANT)));
    await vi.waitFor(() => page.getByRole('img', { name: 'Square du Vert-Galant' }).element());

    expect(dotOf('Square du Vert-Galant').querySelector('[data-disc]')).toHaveAttribute('fill', '#7D838A');
  });

  it('shows its name beside the dot', async () => {
    shown(of(opened(FLORE)));

    await expect.element(page.getByText('Café de Flore')).toBeVisible();
  });

  it('writes its name in the colour of its family on the map', async () => {
    shown(of(opened(FLORE)));

    await expect.element(page.getByText('Café de Flore')).toHaveStyle({ color: 'rgb(181, 90, 37)' });
  });

  it('writes its name in the dark colour of its family in the dark theme', async () => {
    shown(of(opened(FLORE)), 'dark');

    await expect.element(page.getByText('Café de Flore')).toHaveStyle({ color: 'rgb(240, 160, 106)' });
  });

  it('is marked by a red pin, without its name, when its family has no pictogram', async () => {
    shown(of(opened(CASTLE)));
    await vi.waitFor(() => page.getByRole('img', { name: 'Château' }).element());

    await expect.element(page.getByText('Château')).not.toBeInTheDocument();
  });

  it('is marked by a red pin of 30 by 40 px', async () => {
    shown(of(opened(CASTLE)));
    await vi.waitFor(() => page.getByRole('img', { name: 'Château' }).element());

    expect(dotOf('Château').getBoundingClientRect().height).toBe(40);
  });

  it('stands above the other marks of the map', async () => {
    shown(of(opened(FLORE)));
    await vi.waitFor(() => page.getByRole('img', { name: 'Café de Flore' }).element());

    expect(Number(getComputedStyle(dotOf('Café de Flore').closest('.maplibregl-marker') ?? document.body).zIndex)).toBe(3);
  });
});

const floreFollowedBy = async (next: PlaceSheet): Promise<MapLibreMap> => {
  const sheet = new BehaviorSubject<PlaceSheet>(opened(FLORE));
  const map = shown(sheet);
  await vi.waitFor(() => page.getByRole('img', { name: 'Café de Flore' }).element());
  sheet.next(next);
  return map;
};

describe('the place closed', () => {
  it('leaves the map without its dot', async () => {
    await floreFollowedBy({ status: 'closed' });

    await expect.element(page.getByRole('img', { name: 'Café de Flore' })).not.toBeInTheDocument();
  });

  it('leaves the map where it was', async () => {
    const map = await floreFollowedBy({ status: 'closed' });

    expect(map.getCenter()).toEqual(CENTRE);
  });

  it('gives way to the next place opened', async () => {
    await floreFollowedBy(opened(VERT_GALANT));

    await expect.element(page.getByRole('img', { name: 'Café de Flore' })).not.toBeInTheDocument();
  });
});
