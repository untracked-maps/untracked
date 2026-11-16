import type { Coordinates, Place } from './place';

type PlaceView = {
  readonly center: Coordinates;
  readonly zoom: number;
};

const PLACE_ZOOM = 16.5;

const viewOfChosenPlace = ({ coordinates }: Place, zoom: number): PlaceView => ({
  center: coordinates,
  zoom: Math.max(zoom, PLACE_ZOOM)
});

export { viewOfChosenPlace };
