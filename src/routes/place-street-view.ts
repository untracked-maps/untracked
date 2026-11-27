import { map, type Observable, of } from 'rxjs';
import { openedPlaceOf, type PlaceSheet } from '#features/places/abilities/open-place/domain/open-place';
import { type StreetView, showStreetView } from '#features/places/abilities/show-street-view/domain/show-street-view';
import { prerenderedPicture } from '#features/places/abilities/show-street-view/implementation/prerendered/prerendered-picture';
import { browser } from '$app/env';
import { resolve } from '$app/paths';

const urlOf = (id: string): string => resolve('/data/panoramax/[id].json', { id });

const fetchFile = (url: string): Promise<Response> => fetch(url);

const placeStreetView = (sheet: Observable<PlaceSheet>): Observable<StreetView> =>
  browser
    ? showStreetView({ loadPicture: prerenderedPicture(fetchFile, urlOf) })({ opened: sheet.pipe(map(openedPlaceOf)) })
    : of({ status: 'none' });

export { placeStreetView };
