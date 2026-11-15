import type { FillLayerSpecification, LineLayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import type { Palette } from './colours';
import { dashes, exponentialZoom, isGeometry, isOneOf } from './expressions';
import { fromTiles } from './tiles';

const pedestrianAreaLayers = (palette: Palette): FillLayerSpecification[] => [
  {
    id: 'pedestrian-area',
    type: 'fill',
    ...fromTiles('transportation'),
    minzoom: 15,
    filter: ['all', isGeometry('Polygon'), isOneOf('subclass', ['pedestrian', 'platform'])],
    paint: { 'fill-color': palette.pedestrian }
  }
];

const pedestrianStreet = (palette: Palette): LineLayerSpecification => ({
  id: 'pedestrian-street',
  type: 'line',
  ...fromTiles('transportation'),
  minzoom: 14.5,
  filter: ['all', isGeometry('LineString'), ['==', ['get', 'subclass'], 'pedestrian']],
  layout: { 'line-cap': 'round', 'line-join': 'round' },
  paint: {
    'line-color': palette.road,
    'line-width': exponentialZoom([
      { zoom: 14.5, value: 1 },
      { zoom: 16, value: 4 },
      { zoom: 19, value: 16 }
    ])
  }
});

const path = (palette: Palette): LineLayerSpecification => ({
  id: 'path',
  type: 'line',
  ...fromTiles('transportation'),
  minzoom: 16,
  filter: ['all', isGeometry('LineString'), isOneOf('subclass', ['path', 'track', 'bridleway', 'steps'])],
  paint: {
    'line-color': palette.path,
    'line-width': exponentialZoom([
      { zoom: 16, value: 0.8 },
      { zoom: 19, value: 2 }
    ]),
    'line-dasharray': dashes({ dash: 2.5, gap: 2 })
  }
});

const pedestrianWayLayers = (palette: Palette): LineLayerSpecification[] => [pedestrianStreet(palette), path(palette)];

export { pedestrianAreaLayers, pedestrianWayLayers };
