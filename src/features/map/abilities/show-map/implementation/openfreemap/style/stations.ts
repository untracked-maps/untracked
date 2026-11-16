import type { SymbolLayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import type { Palette } from './colours';
import { exponentialZoom, isOneOf, localName } from './expressions';
import { fonts } from './fonts';
import { metroIcon } from './sprite';
import { fromTiles } from './tiles';

const nameMinZoom = 14.5;

const stationLayers = (palette: Palette): SymbolLayerSpecification[] => [
  {
    id: 'station',
    type: 'symbol',
    ...fromTiles('poi'),
    minzoom: 13,
    filter: ['all', ['==', ['get', 'class'], 'railway'], isOneOf('subclass', ['subway', 'station', 'halt'])],
    layout: {
      'icon-image': metroIcon,
      'icon-size': exponentialZoom([
        { zoom: 13, value: 0.62 },
        { zoom: 16, value: 1 }
      ]),
      'icon-allow-overlap': true,
      'icon-padding': 0,
      'text-field': ['step', ['zoom'], '', nameMinZoom, localName],
      'text-font': fonts.semibold,
      'text-size': 12,
      'text-anchor': 'left',
      'text-offset': [1, 0],
      'text-optional': true
    },
    paint: { 'text-color': palette.stationLabel, 'text-halo-color': palette.halo, 'text-halo-width': 1.6 }
  }
];

export { stationLayers };
