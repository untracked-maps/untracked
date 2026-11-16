import type { Coordinates } from '../../../domain/place';

type Located = {
  readonly coordinates: Coordinates;
};

type Bounds = {
  readonly west: number;
  readonly south: number;
  readonly east: number;
  readonly north: number;
};

const pointBounds = ({ coordinates: { longitude, latitude } }: Located): Bounds => ({
  west: longitude,
  south: latitude,
  east: longitude,
  north: latitude
});

const widened = (bounds: Bounds, { coordinates: { longitude, latitude } }: Located): Bounds => ({
  west: Math.min(bounds.west, longitude),
  south: Math.min(bounds.south, latitude),
  east: Math.max(bounds.east, longitude),
  north: Math.max(bounds.north, latitude)
});

const boundsOf = ([first, ...others]: readonly [Located, ...Located[]]): Bounds => others.reduce(widened, pointBounds(first));

export { boundsOf };
