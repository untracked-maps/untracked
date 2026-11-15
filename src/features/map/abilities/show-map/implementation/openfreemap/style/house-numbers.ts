import type { SymbolLayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import type { Palette } from './colours';
import { fonts } from './fonts';
import { fromTiles } from './tiles';

const houseNumberLayers = (palette: Palette): SymbolLayerSpecification[] => [
  {
    id: 'housenumber',
    type: 'symbol',
    ...fromTiles('housenumber'),
    minzoom: 18,
    layout: { 'text-field': ['get', 'housenumber'], 'text-font': fonts.regular, 'text-size': 10.5 },
    paint: { 'text-color': palette.houseNumber }
  }
];

export { houseNumberLayers };
