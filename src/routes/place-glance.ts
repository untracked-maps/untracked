import { map, type Observable, of } from 'rxjs';
import {
  type Glance,
  type GlancePlace,
  glanceAtPlace
} from '#features/places/abilities/glance-at-place/domain/glance-at-place';
import type { PlaceSheet } from '#features/places/abilities/open-place/domain/open-place';
import type { HoursView } from '#features/places/abilities/show-opening-hours/domain/show-opening-hours';
import { clock } from '#features/places/abilities/show-station/implementation/browser/clock';
import { browser } from '$app/env';
import type { Position } from './locating';

const now = (): number => Date.now();

const glancedOf = (sheet: PlaceSheet): GlancePlace | undefined => {
  if (sheet.status !== 'open') {
    return undefined;
  }
  const { id, coordinates, tags } = sheet.place;
  return tags === undefined ? { id, coordinates } : { id, coordinates, tags };
};

const shownHours = (view: HoursView): boolean => view.status === 'known' || view.status === 'unreadable';

const placeGlance = (
  sheet: Observable<PlaceSheet>,
  hours: Observable<HoursView>,
  position: Observable<Position | undefined>
): Observable<Glance> =>
  browser
    ? glanceAtPlace({
        opened: sheet.pipe(map(glancedOf)),
        position,
        hoursShown: hours.pipe(map(shownHours)),
        time: clock(now)
      })
    : of({ columns: [] });

export { placeGlance };
