import { EMPTY, firstValueFrom, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { type CameraMove, type FramingInputs, frameMap, type MapMeasures } from './frame-map';
import type { Coordinates } from './show-map';

const LOUVRE = { longitude: 2.337_64, latitude: 48.860_61 };

const ORSAY = { longitude: 2.326_56, latitude: 48.86 };

const PHONE: MapMeasures = { width: 400, height: 800, zoom: 13, topBarBottom: 72, sheet: { layout: 'bottom', height: 368 } };

const LARGE: MapMeasures = {
  width: 1280,
  height: 800,
  zoom: 13,
  topBarBottom: 72,
  sheet: { layout: 'side', width: 400, end: 412 }
};

type Framed =
  | { readonly kind: 'place' | 'district'; readonly at: Coordinates }
  | { readonly kind: 'places'; readonly at: readonly [Coordinates, ...Coordinates[]] };

const inputsOf = (framed: Framed): FramingInputs => ({
  placesOpened: framed.kind === 'place' ? of(framed.at) : EMPTY,
  districtsOpened: framed.kind === 'district' ? of(framed.at) : EMPTY,
  placesListed: framed.kind === 'places' ? of(framed.at) : EMPTY
});

const moveOf = (framed: Framed, measures: MapMeasures): Promise<CameraMove> =>
  firstValueFrom(frameMap({ measure: () => of(measures) })(inputsOf(framed)));

describe('the flight to one place', () => {
  it('flies to the place', async () => {
    expect(await moveOf({ kind: 'place', at: LOUVRE }, PHONE)).toMatchObject({ kind: 'flight', center: LOUVRE });
  });

  it('flies in 800 ms', async () => {
    expect(await moveOf({ kind: 'place', at: LOUVRE }, PHONE)).toMatchObject({ duration: 800 });
  });

  it('zooms in to zoom 16.5 from afar', async () => {
    expect(await moveOf({ kind: 'place', at: LOUVRE }, PHONE)).toMatchObject({ zoom: 16.5 });
  });

  it('keeps a closer zoom', async () => {
    expect(await moveOf({ kind: 'place', at: LOUVRE }, { ...PHONE, zoom: 18 })).toMatchObject({ zoom: 18 });
  });

  it('shows a district at zoom 14', async () => {
    expect(await moveOf({ kind: 'district', at: LOUVRE }, { ...PHONE, zoom: 18 })).toMatchObject({ zoom: 14 });
  });

  it('flies to the district', async () => {
    expect(await moveOf({ kind: 'district', at: LOUVRE }, PHONE)).toMatchObject({ center: LOUVRE });
  });

  it('sets the place in the middle of what the top bar and a bottom sheet leave visible', async () => {
    expect(await moveOf({ kind: 'place', at: LOUVRE }, PHONE)).toMatchObject({ offset: { right: 0, down: -148 } });
  });

  it('sets the place in the middle of what the top bar and a side panel leave visible', async () => {
    expect(await moveOf({ kind: 'place', at: LOUVRE }, LARGE)).toMatchObject({ offset: { right: 206, down: 36 } });
  });

  it('rounds the offset to whole pixels', async () => {
    expect(
      await moveOf({ kind: 'place', at: LOUVRE }, { ...PHONE, topBarBottom: 71, sheet: { layout: 'side', width: 1, end: 1 } })
    ).toMatchObject({ offset: { right: 1, down: 36 } });
  });

  it('can be left out of the animation', async () => {
    expect(await moveOf({ kind: 'place', at: LOUVRE }, PHONE)).toMatchObject({ essential: false });
  });
});

describe('the fit of several places', () => {
  const framed: Framed = { kind: 'places', at: [LOUVRE, ORSAY] };

  it('fits the places', async () => {
    expect(await moveOf(framed, PHONE)).toMatchObject({
      kind: 'fit',
      bounds: { west: 2.326_56, south: 48.86, east: 2.337_64, north: 48.860_61 }
    });
  });

  it('fits a single place on itself', async () => {
    expect(await moveOf({ kind: 'places', at: [ORSAY] }, PHONE)).toMatchObject({
      bounds: { west: 2.326_56, south: 48.86, east: 2.326_56, north: 48.86 }
    });
  });

  it('fits in 700 ms', async () => {
    expect(await moveOf(framed, PHONE)).toMatchObject({ duration: 700 });
  });

  it('goes no closer than zoom 17', async () => {
    expect(await moveOf(framed, PHONE)).toMatchObject({ maxZoom: 17 });
  });

  it('keeps 24 px under the top bar and above the sheet, 36 px on the sides, on a phone', async () => {
    expect(await moveOf(framed, PHONE)).toMatchObject({ padding: { top: 96, right: 36, bottom: 392, left: 36 } });
  });

  it('counts the sheet for 60 % of the map at most', async () => {
    expect(await moveOf(framed, { ...PHONE, sheet: { layout: 'bottom', height: 481 } })).toMatchObject({
      padding: { bottom: 504 }
    });
  });

  it('keeps 60 px on every side and the panel width plus 60 on the left, on a large screen', async () => {
    expect(await moveOf(framed, LARGE)).toMatchObject({ padding: { top: 60, right: 60, bottom: 60, left: 460 } });
  });

  it('can be left out of the animation', async () => {
    expect(await moveOf(framed, PHONE)).toMatchObject({ essential: false });
  });
});
