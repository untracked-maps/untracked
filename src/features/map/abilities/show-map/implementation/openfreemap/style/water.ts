import type { FillLayerSpecification, LineLayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import type { Palette } from './colours';
import { exponentialZoom } from './expressions';
import { fromTiles } from './tiles';

const waterLayers = (palette: Palette): (FillLayerSpecification | LineLayerSpecification)[] => [
  { id: 'water', type: 'fill', ...fromTiles('water'), paint: { 'fill-color': palette.water } },
  {
    id: 'waterway',
    type: 'line',
    ...fromTiles('waterway'),
    paint: {
      'line-color': palette.water,
      'line-width': exponentialZoom([
        { zoom: 10, value: 1 },
        { zoom: 18, value: 8 }
      ])
    }
  }
];

export { waterLayers };
