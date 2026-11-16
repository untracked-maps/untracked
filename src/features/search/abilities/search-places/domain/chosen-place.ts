import type { Coordinates, Place } from '../../../domain/place';

type ShownPlace = Pick<Place, 'name' | 'coordinates'>;

type PlaceView = {
  readonly center: Coordinates;
  readonly zoom: number;
};

const PLACE_ZOOM = 16.5;

const viewOfChosenPlace = ({ coordinates }: ShownPlace, zoom: number): PlaceView => ({
  center: coordinates,
  zoom: Math.max(zoom, PLACE_ZOOM)
});

export { type ShownPlace, viewOfChosenPlace };
