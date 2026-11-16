import type { Found } from '../../../domain/found';
import type { Coordinates } from '../../../domain/place';

type ShownPlace = Pick<Found, 'name' | 'kind' | 'coordinates'>;

type PlaceView = {
  readonly center: Coordinates;
  readonly zoom: number;
};

const PLACE_ZOOM = 16.5;

const DISTRICT_ZOOM = 14;

const viewOfChosenPlace = ({ kind, coordinates }: ShownPlace, zoom: number): PlaceView => ({
  center: coordinates,
  zoom: kind === 'district' ? DISTRICT_ZOOM : Math.max(zoom, PLACE_ZOOM)
});

export { type ShownPlace, viewOfChosenPlace };
