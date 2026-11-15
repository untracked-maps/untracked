import type { FillLayerSpecification, LineLayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import { colours } from './colours';
import { fadeIn, linearZoom } from './expressions';
import { fromTiles } from './tiles';

const buildingLayers: (FillLayerSpecification | LineLayerSpecification)[] = [
  {
    id: 'building',
    type: 'fill',
    ...fromTiles('building'),
    minzoom: 14,
    paint: {
      'fill-color': colours.building,
      'fill-outline-color': colours.buildingEdge,
      'fill-opacity': fadeIn({ from: 14, to: 15 })
    }
  },
  {
    id: 'building-edge',
    type: 'line',
    ...fromTiles('building'),
    minzoom: 16,
    paint: {
      'line-color': colours.buildingEdge,
      'line-width': 0.5,
      'line-opacity': linearZoom([
        { zoom: 16, value: 0 },
        { zoom: 17, value: 0.6 }
      ])
    }
  }
];

export { buildingLayers };
