import { ignoreElements, map, type Observable, of, switchMap, take } from 'rxjs';
import type { PlaceSheet } from '#features/places/abilities/open-place/domain/open-place';
import {
  type HoursPlace,
  type HoursView,
  showOpeningHours
} from '#features/places/abilities/show-opening-hours/domain/show-opening-hours';
import { lazyOpeningHours } from '#features/places/abilities/show-opening-hours/implementation/lazy/lazy-opening-hours';
import { clock } from '#features/places/abilities/show-station/implementation/browser/clock';
import { browser } from '$app/env';

type PlaceHours = {
  readonly view: Observable<HoursView>;
  readonly preloaded: (shown: Observable<unknown>) => Observable<never>;
};

const now = (): number => Date.now();

const hoursPlaceOf =
  (timeZone: string) =>
  (sheet: PlaceSheet): HoursPlace | undefined => {
    if (sheet.status !== 'open') {
      return undefined;
    }
    const { id, kind, tags, address, coordinates } = sheet.place;
    const openingHours = tags?.['opening_hours'];
    return {
      id,
      ...(kind === undefined ? {} : { kind }),
      ...(openingHours === undefined ? {} : { openingHours }),
      where: { coordinates, timeZone, ...(address === undefined ? {} : { country: address.addressCountry }) }
    };
  };

const placeHours = (sheet: Observable<PlaceSheet>, timeZone: string): PlaceHours => ({
  view: browser
    ? showOpeningHours({ loadHoursReader: lazyOpeningHours })({
        opened: sheet.pipe(map(hoursPlaceOf(timeZone))),
        time: clock(now)
      })
    : of({ status: 'none' }),
  preloaded: (shown) =>
    shown.pipe(
      take(1),
      switchMap(() => lazyOpeningHours()),
      ignoreElements()
    )
});

export { type PlaceHours, placeHours };
