import type { MapView } from '../../domain/show-map';

type Camera = {
  readonly center: readonly [number, number];
  readonly zoom: number;
};

const cameraOf = ({ center, zoom }: MapView): Camera => ({ center: [center.longitude, center.latitude], zoom });

export { cameraOf };
