import { Map as MapLibreMap, type StyleSpecification, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { BehaviorSubject, type Observable, of, Subject, type Subscription } from 'rxjs';
import { describe, expect, it, onTestFinished } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import type { Coordinates, InspectedSpot } from '../../domain/inspect-point';
import { inspectedSpotOverlay } from './inspected-spot-overlay';

const RIVOLI: InspectedSpot = {
  kind: 'address',
  spot: { longitude: 2.337_64, latitude: 48.860_61 },
  address: { street: 'Rue de Rivoli', postalCode: '75001', addressLocality: 'Paris', addressCountry: 'FR' }
};

const NONE: InspectedSpot = { kind: 'none' };

const CENTRE: Coordinates = { longitude: 2.352, latitude: 48.857 };

const EMPTY_STYLE: StyleSpecification = { version: 8, sources: {}, layers: [] };

const mapCentredOn = (longitude: number): MapLibreMap => {
  setWorkerUrl(workerUrl);
  const container = document.body.appendChild(document.createElement('div'));
  container.setAttribute('style', 'inline-size: 400px; block-size: 300px');
  const map = new MapLibreMap({ container, style: EMPTY_STYLE, center: [longitude, CENTRE.latitude], zoom: 13 });
  onTestFinished(() => {
    map.remove();
    container.remove();
  });
  return map;
};

const listening = (overlay$: Observable<unknown>): Subscription => {
  const listened = overlay$.subscribe();
  onTestFinished(() => listened.unsubscribe());
  return listened;
};

type Recorded = {
  readonly inspected: Coordinates[];
  readonly map: MapLibreMap;
};

const listenedMap = (spot: InspectedSpot = NONE, longitude = CENTRE.longitude): Recorded => {
  const recorded: Recorded = { inspected: [], map: mapCentredOn(longitude) };
  const onInspect = (inspected: Coordinates): void => {
    recorded.inspected.push(inspected);
  };
  listening(inspectedSpotOverlay(new BehaviorSubject(spot), { onInspect })(recorded.map));
  recorded.map.getCanvas().focus();
  return recorded;
};

const rounded = ({ longitude, latitude }: Coordinates): Coordinates => ({
  longitude: Math.round(longitude * 1000) / 1000,
  latitude: Math.round(latitude * 1000) / 1000
});

const NO_ACTION = { onInspect: (): undefined => undefined };

const spotMark = (): ReturnType<typeof page.getByRole> => page.getByRole('img', { name: 'Selected spot' });

describe('inspected spot overlay, on the map', () => {
  it('marks the spot inspected', async () => {
    listening(inspectedSpotOverlay(new BehaviorSubject<InspectedSpot>(RIVOLI), NO_ACTION)(mapCentredOn(CENTRE.longitude)));

    await expect.element(spotMark()).toBeVisible();
  });

  it('marks nothing while no spot is inspected', async () => {
    listening(inspectedSpotOverlay(new BehaviorSubject(NONE), NO_ACTION)(mapCentredOn(CENTRE.longitude)));

    await expect.element(spotMark()).not.toBeInTheDocument();
  });

  it('removes the mark once the spot is dismissed', async () => {
    const spot = new BehaviorSubject<InspectedSpot>(RIVOLI);
    listening(inspectedSpotOverlay(spot, NO_ACTION)(mapCentredOn(CENTRE.longitude)));

    spot.next(NONE);

    await expect.element(spotMark()).not.toBeInTheDocument();
  });

  it('removes the mark once the map no longer shows it', async () => {
    listening(
      inspectedSpotOverlay(new BehaviorSubject<InspectedSpot>(RIVOLI), NO_ACTION)(mapCentredOn(CENTRE.longitude))
    ).unsubscribe();

    await expect.element(spotMark()).not.toBeInTheDocument();
  });

  it('gives the focus back to the map once the spot is dismissed', () => {
    const spot = new BehaviorSubject<InspectedSpot>(RIVOLI);
    const map = mapCentredOn(CENTRE.longitude);
    listening(inspectedSpotOverlay(spot, NO_ACTION)(map));

    spot.next(NONE);

    expect(document.activeElement).toBe(map.getCanvas());
  });

  it('leaves the focus in a field the visitor types in', () => {
    const spot = new BehaviorSubject<InspectedSpot>(RIVOLI);
    listening(inspectedSpotOverlay(spot, NO_ACTION)(mapCentredOn(CENTRE.longitude)));
    const field = document.body.appendChild(document.createElement('input'));
    onTestFinished(() => field.remove());
    field.focus();

    spot.next(NONE);

    expect(document.activeElement).toBe(field);
  });

  it('leaves the focus where it is when another spot is inspected', () => {
    const spot = new BehaviorSubject<InspectedSpot>(RIVOLI);
    listening(inspectedSpotOverlay(spot, NO_ACTION)(mapCentredOn(CENTRE.longitude)));

    spot.next({ kind: 'no-address', spot: CENTRE });

    expect(document.activeElement).toBe(document.body);
  });

  it('leaves the focus where it is when nothing was inspected', () => {
    const spot = new Subject<InspectedSpot>();
    listening(inspectedSpotOverlay(spot, NO_ACTION)(mapCentredOn(CENTRE.longitude)));

    spot.next(NONE);
    spot.next(NONE);

    expect(document.activeElement).toBe(document.body);
  });
});

describe('inspected spot overlay, from the visitor', () => {
  it('leaves the clicks to the touches of the map', async () => {
    const { inspected, map } = listenedMap();

    await userEvent.click(map.getCanvas());

    expect(inspected).toEqual([]);
  });

  it('leaves the right clicks to the touches of the map', async () => {
    const { inspected, map } = listenedMap();

    await userEvent.click(map.getCanvas(), { button: 'right' });

    expect(inspected).toEqual([]);
  });

  it('inspects the centre of the map on Enter', async () => {
    const { inspected } = listenedMap();

    await userEvent.keyboard('{Enter}');

    expect(inspected.map(rounded)).toEqual([CENTRE]);
  });

  it('inspects a spot within the first world', async () => {
    const { inspected } = listenedMap(NONE, CENTRE.longitude + 360);

    await userEvent.keyboard('{Enter}');

    expect(inspected.map(rounded)).toEqual([CENTRE]);
  });

  it('inspects nothing on other keys', async () => {
    const { inspected } = listenedMap();

    await userEvent.keyboard('{Shift}');

    expect(inspected).toEqual([]);
  });

  it('stops listening once the map no longer shows it', async () => {
    const map = mapCentredOn(CENTRE.longitude);
    const inspected: Coordinates[] = [];
    const onInspect = (spot: Coordinates): void => {
      inspected.push(spot);
    };
    listening(inspectedSpotOverlay(of(NONE), { ...NO_ACTION, onInspect })(map)).unsubscribe();
    map.getCanvas().focus();

    await userEvent.keyboard('{Enter}');

    expect(inspected).toEqual([]);
  });
});
