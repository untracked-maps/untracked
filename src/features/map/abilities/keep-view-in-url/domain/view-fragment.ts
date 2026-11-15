type Coordinates = {
  readonly longitude: number;
  readonly latitude: number;
};

type MapView = {
  readonly center: Coordinates;
  readonly zoom: number;
};

const VIEW_KEY = 'map';
const DECIMAL_NUMBER = /^-?\d+(?:\.\d+)?$/u;
const VIEW_PARTS = 3;
const MAX_ZOOM = 22;
const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;
const ZOOM_DECIMALS = 2;
const HALF_PIXELS_AROUND_THE_WORLD_AT_ZOOM_0 = 1024;
const DEGREES_AROUND_THE_WORLD = 360;

const isWithin = (value: number, min: number, max: number): boolean => min <= value && value <= max;

const isValid = ({ center: { longitude, latitude }, zoom }: MapView): boolean =>
  isWithin(zoom, 0, MAX_ZOOM) &&
  isWithin(latitude, -MAX_LATITUDE, MAX_LATITUDE) &&
  isWithin(longitude, -MAX_LONGITUDE, MAX_LONGITUDE);

const isDecimalNumber = (part: string): boolean => DECIMAL_NUMBER.test(part);

const viewOfValue = (value: string): MapView | undefined => {
  const parts = value.split('/');
  const view: MapView = {
    center: { longitude: Number(parts[2]), latitude: Number(parts[1]) },
    zoom: Number(parts[0])
  };
  return parts.length === VIEW_PARTS && parts.every(isDecimalNumber) && isValid(view) ? view : undefined;
};

const viewOfFragment = (fragment: string): MapView | undefined => {
  const value = new URLSearchParams(fragment).get(VIEW_KEY);
  return value === null ? undefined : viewOfValue(value);
};

const rounded = (value: number, decimals: number): number => Number(value.toFixed(decimals));

const coordinateDecimals = (zoom: number): number =>
  Math.ceil(Math.log10((2 ** zoom * HALF_PIXELS_AROUND_THE_WORLD_AT_ZOOM_0) / DEGREES_AROUND_THE_WORLD));

const fragmentOfView = ({ center: { longitude, latitude }, zoom }: MapView): string => {
  const decimals = coordinateDecimals(zoom);
  return `${VIEW_KEY}=${rounded(zoom, ZOOM_DECIMALS)}/${rounded(latitude, decimals)}/${rounded(longitude, decimals)}`;
};

export { fragmentOfView, type MapView, viewOfFragment };
