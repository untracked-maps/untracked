import type { ExpressionSpecification, LineLayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import type { Palette } from './colours';
import { dashes, exponentialZoom } from './expressions';
import { fromTiles } from './tiles';

const regionAdminLevel = 4;

const countryAdminLevel = 2;

const cityAdminLevel = 8;

const onLand: ExpressionSpecification = ['!=', ['get', 'maritime'], 1];

const regionBoundary = (palette: Palette): LineLayerSpecification => ({
  id: 'boundary-region',
  type: 'line',
  ...fromTiles('boundary'),
  minzoom: 5,
  maxzoom: 11,
  filter: ['all', ['==', ['get', 'admin_level'], regionAdminLevel], onLand],
  paint: {
    'line-color': palette.border,
    'line-width': exponentialZoom([
      { zoom: 5, value: 0.6 },
      { zoom: 10, value: 1 }
    ]),
    'line-dasharray': dashes({ dash: 3, gap: 2 }),
    'line-opacity': 0.55
  }
});

const countryBoundary = (palette: Palette): LineLayerSpecification => ({
  id: 'boundary-country',
  type: 'line',
  ...fromTiles('boundary'),
  filter: ['all', ['==', ['get', 'admin_level'], countryAdminLevel], onLand],
  layout: { 'line-join': 'round' },
  paint: {
    'line-color': palette.border,
    'line-width': exponentialZoom([
      { zoom: 3, value: 0.8 },
      { zoom: 7, value: 1.6 },
      { zoom: 12, value: 2.4 }
    ]),
    'line-opacity': 0.9
  }
});

const cityBoundary = (palette: Palette): LineLayerSpecification => ({
  id: 'boundary-city',
  type: 'line',
  ...fromTiles('boundary'),
  maxzoom: 13,
  filter: ['==', ['get', 'admin_level'], cityAdminLevel],
  paint: { 'line-color': palette.cityBorder, 'line-width': 1, 'line-dasharray': dashes({ dash: 3, gap: 2 }) }
});

const boundaryLayers = (palette: Palette): LineLayerSpecification[] => [
  regionBoundary(palette),
  countryBoundary(palette),
  cityBoundary(palette)
];

export { boundaryLayers };
