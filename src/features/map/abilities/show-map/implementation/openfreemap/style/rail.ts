import type { LineLayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import type { Palette } from './colours';
import { exponentialZoom, isNotTunnel } from './expressions';
import { fromTiles } from './tiles';

const railLayers = (palette: Palette): LineLayerSpecification[] => [
  {
    id: 'rail',
    type: 'line',
    ...fromTiles('transportation'),
    minzoom: 12,
    filter: ['all', ['==', ['get', 'class'], 'rail'], isNotTunnel],
    paint: {
      'line-color': palette.rail,
      'line-width': exponentialZoom([
        { zoom: 12, value: 0.8 },
        { zoom: 18, value: 2.5 }
      ])
    }
  }
];

export { railLayers };
