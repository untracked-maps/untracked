import type { Observable } from 'rxjs';
import type { PlaceSheet } from '#features/places/abilities/open-place/domain/open-place';
import type { Photos } from '#features/places/abilities/show-photos/domain/show-photos';
import type { StreetView } from '#features/places/abilities/show-street-view/domain/show-street-view';
import { type HomeStation, homeStation } from './home-station';
import { type PlaceHours, placeHours, type Zone } from './opening-hours';
import { placePhotos } from './place-photos';
import { placeStreetView } from './place-street-view';

type SheetSections = {
  readonly hours: PlaceHours;
  readonly photos: Observable<Photos>;
  readonly streetView: Observable<StreetView>;
  readonly station: HomeStation;
};

const sheetSections = (sheet: Observable<PlaceSheet>, zone: Zone): SheetSections => ({
  station: homeStation(sheet),
  hours: placeHours(sheet, zone),
  photos: placePhotos(sheet),
  streetView: placeStreetView(sheet)
});

export { type SheetSections, sheetSections };
