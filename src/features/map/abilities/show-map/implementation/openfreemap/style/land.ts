import type { BackgroundLayerSpecification, FillLayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import type { Palette } from './colours';
import { isOneOf, linearZoom } from './expressions';
import { fromTiles } from './tiles';

const land = (palette: Palette): BackgroundLayerSpecification => ({
  id: 'land',
  type: 'background',
  paint: {
    'background-color': linearZoom([
      { zoom: 7, value: palette.landFar },
      { zoom: 10, value: palette.land }
    ])
  }
});

const landUses = (palette: Palette): FillLayerSpecification[] => [
  {
    id: 'landuse-alt',
    type: 'fill',
    ...fromTiles('landuse'),
    minzoom: 12,
    filter: isOneOf('class', ['commercial', 'retail', 'hospital', 'school', 'university', 'college', 'railway']),
    paint: { 'fill-color': palette.landAlt }
  },
  {
    id: 'landuse-green',
    type: 'fill',
    ...fromTiles('landuse'),
    filter: isOneOf('class', ['cemetery', 'pitch', 'stadium', 'playground', 'garden']),
    paint: { 'fill-color': palette.park, 'fill-opacity': 0.85 }
  }
];

const landCovers = (palette: Palette): FillLayerSpecification[] => [
  {
    id: 'landcover',
    type: 'fill',
    ...fromTiles('landcover'),
    filter: isOneOf('class', ['grass', 'farmland', 'wetland']),
    paint: { 'fill-color': palette.park }
  },
  {
    id: 'landcover-wood',
    type: 'fill',
    ...fromTiles('landcover'),
    filter: isOneOf('class', ['wood']),
    paint: { 'fill-color': palette.wood }
  },
  { id: 'park', type: 'fill', ...fromTiles('park'), paint: { 'fill-color': palette.park } }
];

const landLayers = (palette: Palette): (BackgroundLayerSpecification | FillLayerSpecification)[] => [
  land(palette),
  ...landUses(palette),
  ...landCovers(palette)
];

export { landLayers };
