import type { MapView } from '../../domain/show-map';

type Camera = {
  readonly center: readonly [number, number];
  readonly zoom: number;
};

type LngLat = {
  readonly lng: number;
  readonly lat: number;
};

const cameraOf = ({ center, zoom }: MapView): Camera => ({ center: [center.longitude, center.latitude], zoom });

const viewOf = ({ lng, lat }: LngLat, zoom: number): MapView => ({ center: { longitude: lng, latitude: lat }, zoom });

export { cameraOf, viewOf };
