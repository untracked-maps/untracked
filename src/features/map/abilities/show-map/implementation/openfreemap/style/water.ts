import type { FillLayerSpecification, LineLayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import { colours } from './colours';
import { exponentialZoom } from './expressions';
import { fromTiles } from './tiles';

const waterLayers: (FillLayerSpecification | LineLayerSpecification)[] = [
  { id: 'water', type: 'fill', ...fromTiles('water'), paint: { 'fill-color': colours.water } },
  {
    id: 'waterway',
    type: 'line',
    ...fromTiles('waterway'),
    paint: {
      'line-color': colours.water,
      'line-width': exponentialZoom([
        { zoom: 10, value: 1 },
        { zoom: 18, value: 8 }
      ])
    }
  }
];

export { waterLayers };
