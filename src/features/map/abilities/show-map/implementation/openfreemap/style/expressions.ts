import type { ExpressionSpecification } from '@maplibre/maplibre-gl-style-spec';

type ZoomStop = {
  readonly zoom: number;
  readonly value: number | string;
};

type ZoomRange = {
  readonly from: number;
  readonly to: number;
};

type DashPattern = {
  readonly dash: number;
  readonly gap: number;
};

const exponentialBase = 1.5;

const flattened = (stops: readonly ZoomStop[]): (number | string)[] => stops.flatMap(({ zoom, value }) => [zoom, value]);

const exponentialZoom = (stops: readonly ZoomStop[]): ExpressionSpecification => [
  'interpolate',
  ['exponential', exponentialBase],
  ['zoom'],
  ...flattened(stops)
];

const linearZoom = (stops: readonly ZoomStop[]): ExpressionSpecification => [
  'interpolate',
  ['linear'],
  ['zoom'],
  ...flattened(stops)
];

const fadeIn = ({ from, to }: ZoomRange): ExpressionSpecification =>
  linearZoom([
    { zoom: from, value: 0 },
    { zoom: to, value: 1 }
  ]);

const localName: ExpressionSpecification = ['coalesce', ['get', 'name:fr'], ['get', 'name'], ['get', 'name:latin']];

const isOneOf = (property: string, values: string[]): ExpressionSpecification => [
  'match',
  ['get', property],
  values,
  true,
  false
];

const isNotTunnel: ExpressionSpecification = ['!=', ['get', 'brunnel'], 'tunnel'];

const isGeometry = (geometry: string): ExpressionSpecification => ['==', ['geometry-type'], geometry];

const dashes = ({ dash, gap }: DashPattern): number[] => [dash, gap];

export { dashes, exponentialZoom, fadeIn, isGeometry, isNotTunnel, isOneOf, linearZoom, localName, type ZoomRange };
