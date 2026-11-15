import type { SymbolLayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import { colours } from './colours';
import { fonts } from './fonts';
import { fromTiles } from './tiles';

const houseNumberLayers: SymbolLayerSpecification[] = [
  {
    id: 'housenumber',
    type: 'symbol',
    ...fromTiles('housenumber'),
    minzoom: 18,
    layout: { 'text-field': ['get', 'housenumber'], 'text-font': fonts.regular, 'text-size': 10.5 },
    paint: { 'text-color': colours.houseNumber }
  }
];

export { houseNumberLayers };
