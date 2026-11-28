type Area = {
  readonly west: number;
  readonly south: number;
  readonly east: number;
  readonly north: number;
};

type Position = {
  readonly longitude: number;
  readonly latitude: number;
};

const isInside =
  ({ longitude, latitude }: Position) =>
  ({ west, south, east, north }: Area): boolean =>
    longitude >= west && longitude <= east && latitude >= south && latitude <= north;

const isCovered =
  (areas: readonly Area[]) =>
  (position: Position): boolean =>
    areas.some(isInside(position));

const coveredOnly =
  (areas: readonly Area[]) =>
  <Place extends { readonly coordinates: Position }>(places: readonly Place[]): readonly Place[] =>
    places.filter(({ coordinates }) => isCovered(areas)(coordinates));

export { type Area, coveredOnly, isCovered };
