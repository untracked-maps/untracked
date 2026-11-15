import type { SymbolLayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import { colours } from './colours';
import { exponentialZoom, isOneOf, localName } from './expressions';
import { fonts } from './fonts';
import { fromTiles } from './tiles';

const roadNameLayers: SymbolLayerSpecification[] = [
  {
    id: 'road-name-major',
    type: 'symbol',
    ...fromTiles('transportation_name'),
    minzoom: 12.5,
    maxzoom: 14,
    filter: isOneOf('class', ['motorway', 'trunk', 'primary', 'secondary']),
    layout: {
      'symbol-placement': 'line',
      'text-field': localName,
      'text-font': fonts.semibold,
      'text-size': 9.5,
      'text-transform': 'uppercase',
      'text-letter-spacing': 0.06,
      'text-max-angle': 25,
      'symbol-spacing': 400
    },
    paint: { 'text-color': colours.majorRoadLabel, 'text-halo-color': colours.halo, 'text-halo-width': 1.4 }
  },
  {
    id: 'road-name',
    type: 'symbol',
    ...fromTiles('transportation_name'),
    minzoom: 14,
    filter: isOneOf('class', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor']),
    layout: {
      'symbol-placement': 'line',
      'text-field': localName,
      'text-font': fonts.medium,
      'text-transform': 'uppercase',
      'text-size': exponentialZoom([
        { zoom: 14, value: 9.5 },
        { zoom: 17, value: 11.5 },
        { zoom: 19, value: 13 }
      ]),
      'text-max-angle': 28,
      'symbol-spacing': 320,
      'text-letter-spacing': 0.07
    },
    paint: { 'text-color': colours.roadLabel, 'text-halo-color': colours.halo, 'text-halo-width': 1.3 }
  }
];

export { roadNameLayers };
