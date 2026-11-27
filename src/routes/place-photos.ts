import { map, type Observable } from 'rxjs';
import { openedPlaceOf, type PlaceSheet } from '#features/places/abilities/open-place/domain/open-place';
import { type Photos, showPhotos } from '#features/places/abilities/show-photos/domain/show-photos';
import { resolve } from '$app/paths';

const placePhotos = (sheet: Observable<PlaceSheet>): Observable<Photos> =>
  showPhotos({ opened: sheet.pipe(map(openedPlaceOf)) });

const photoSource = (path: string): string => `${resolve('/')}${path}`;

export { photoSource, placePhotos };
