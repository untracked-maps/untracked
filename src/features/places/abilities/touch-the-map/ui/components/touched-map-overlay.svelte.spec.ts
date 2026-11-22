import { Map as MapLibreMap, type StyleSpecification, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { BehaviorSubject, type Observable } from 'rxjs';
import { describe, expect, it, onTestFinished } from 'vitest';
import { userEvent } from 'vitest/browser';
import { touchedMapOverlay } from './touched-map-overlay';

type PlaceAt = Parameters<typeof touchedMapOverlay>[0]['placeAt'];

type Told = {
  readonly map: MapLibreMap;
  readonly done: unknown[];
};

type Listening = {
  readonly placeAt?: PlaceAt;
  readonly sheetOpen?: Observable<boolean>;
  readonly longitude?: number;
};

const CENTRE = { longitude: 2.352, latitude: 48.857 };

const EMPTY_STYLE: StyleSpecification = { version: 8, sources: {}, layers: [] };

const NO_PLACE: PlaceAt = () => undefined;
const NO_SHEET = new BehaviorSubject(false);

const MIDDLE = { clientX: 200, clientY: 150, bubbles: true };

const containerOnScreen = (): HTMLElement => {
  const container = document.createElement('div');
  container.style.cssText = 'position: fixed; inset: 0 auto auto 0; inline-size: 400px; block-size: 300px';
  onTestFinished(() => container.remove());
  return document.body.appendChild(container);
};

const mapCentredOn = (longitude: number): MapLibreMap => {
  setWorkerUrl(workerUrl);
  const map = new MapLibreMap({
    container: containerOnScreen(),
    style: EMPTY_STYLE,
    center: [longitude, CENTRE.latitude],
    zoom: 13
  });
  onTestFinished(() => map.remove());
  return map;
};

const AT_THE_CENTRE = { longitude: expect.closeTo(CENTRE.longitude, 3), latitude: expect.closeTo(CENTRE.latitude, 3) };

const told =
  (done: unknown[]) =>
  (item: unknown): void => {
    done.push(item);
  };

const overlayOf = (done: unknown[], placeAt: PlaceAt, sheetOpen: Observable<boolean>): ReturnType<typeof touchedMapOverlay> =>
  touchedMapOverlay({
    placeAt,
    vibrate: (milliseconds) => told(done)(`vibrated ${milliseconds} ms`),
    sheetOpen,
    onOpenPlace: (id) => told(done)(`opened ${id}`),
    onInspect: told(done),
    onClose: () => told(done)('closed')
  });

const listened = ({ placeAt = NO_PLACE, sheetOpen = NO_SHEET, longitude = CENTRE.longitude }: Listening = {}): Told => {
  const done: unknown[] = [];
  const map = mapCentredOn(longitude);
  const subscription = overlayOf(done, placeAt, sheetOpen)(map).subscribe();
  onTestFinished(() => subscription.unsubscribe());
  return { map, done };
};

const pause = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const pressed = (map: MapLibreMap, at = MIDDLE): void => {
  map.getCanvasContainer().dispatchEvent(new PointerEvent('pointerdown', at));
  map.getCanvasContainer().dispatchEvent(new MouseEvent('mousedown', at));
};

const released = (map: MapLibreMap): void => {
  map.getCanvasContainer().dispatchEvent(new PointerEvent('pointerup', MIDDLE));
  map.getCanvasContainer().dispatchEvent(new MouseEvent('mouseup', MIDDLE));
  map.getCanvasContainer().dispatchEvent(new MouseEvent('click', MIDDLE));
};

describe('touching the map', () => {
  it('opens the sheet of the spot touched', async () => {
    const { map, done } = listened();

    await userEvent.click(map.getCanvas());

    expect(done).toEqual([AT_THE_CENTRE]);
  });

  it('opens the place of the dot touched', async () => {
    const { map, done } = listened({ placeAt: (touched) => (touched instanceof MapLibreMap ? 'flore' : 'other') });

    await userEvent.click(map.getCanvas());

    expect(done).toEqual(['opened flore']);
  });

  it('only closes the sheet open when an empty spot is touched', async () => {
    const { map, done } = listened({ sheetOpen: new BehaviorSubject(true) });

    await userEvent.click(map.getCanvas());

    expect(done).toEqual(['closed']);
  });

  it('opens the sheet of a spot within the first world', async () => {
    const { map, done } = listened({ longitude: CENTRE.longitude + 360 });

    await userEvent.click(map.getCanvas());

    expect(done).toEqual([AT_THE_CENTRE]);
  });
});

describe('long-pressing the map', () => {
  it('opens the sheet of the spot at once on a right click, without vibrating, even with a sheet open', async () => {
    const { map, done } = listened({ sheetOpen: new BehaviorSubject(true) });

    await userEvent.click(map.getCanvas(), { button: 'right' });

    expect(done).toEqual([AT_THE_CENTRE]);
  });

  it('opens the sheet of the spot after 480 ms, once the device has vibrated 10 ms', async () => {
    const { map, done } = listened();

    pressed(map);
    await pause(600);

    expect(done).toEqual(['vibrated 10 ms', AT_THE_CENTRE]);
  });

  it('opens the place where the finger went down', async () => {
    const { map, done } = listened({ placeAt: (_, { x }) => (x === 300 ? 'flore' : undefined) });

    pressed(map, { ...MIDDLE, clientX: 300 });
    await pause(600);

    expect(done).toEqual(['vibrated 10 ms', 'opened flore']);
  });

  it('does nothing more when the finger lifts after a long press', async () => {
    const { map, done } = listened();

    pressed(map);
    await pause(600);
    released(map);

    expect(done).toEqual(['vibrated 10 ms', AT_THE_CENTRE]);
  });

  it('counts a touch when the finger lifts before 480 ms', async () => {
    const { map, done } = listened({ sheetOpen: new BehaviorSubject(true) });

    pressed(map);
    released(map);
    await pause(600);

    expect(done).toEqual(['closed']);
  });
});

describe('listening to the map', () => {
  it('counts a click that no press announced', () => {
    const { map, done } = listened();

    map.getCanvasContainer().dispatchEvent(new MouseEvent('mousedown', MIDDLE));
    map.getCanvasContainer().dispatchEvent(new MouseEvent('mouseup', MIDDLE));
    map.getCanvasContainer().dispatchEvent(new MouseEvent('click', MIDDLE));

    expect(done).toEqual([AT_THE_CENTRE]);
  });

  it('stops listening once the map no longer shows it', async () => {
    const done: unknown[] = [];
    const map = mapCentredOn(CENTRE.longitude);
    overlayOf(done, NO_PLACE, NO_SHEET)(map).subscribe().unsubscribe();

    await userEvent.click(map.getCanvas());

    expect(done).toEqual([]);
  });

  it('leaves the map once it no longer shows the touches', () => {
    const map = mapCentredOn(CENTRE.longitude);
    overlayOf([], NO_PLACE, NO_SHEET)(map).subscribe().unsubscribe();

    expect(map.listens('click')).toBe(false);
  });
});
