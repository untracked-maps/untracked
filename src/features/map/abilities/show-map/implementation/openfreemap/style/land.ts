import type { BackgroundLayerSpecification, FillLayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import { colours } from './colours';
import { isOneOf, linearZoom } from './expressions';
import { fromTiles } from './tiles';

const land: BackgroundLayerSpecification = {
  id: 'land',
  type: 'background',
  paint: {
    'background-color': linearZoom([
      { zoom: 7, value: colours.landFar },
      { zoom: 10, value: colours.land }
    ])
  }
};

const landUses: FillLayerSpecification[] = [
  {
    id: 'landuse-alt',
    type: 'fill',
    ...fromTiles('landuse'),
    minzoom: 12,
    filter: isOneOf('class', ['commercial', 'retail', 'hospital', 'school', 'university', 'college', 'railway']),
    paint: { 'fill-color': colours.landAlt }
  },
  {
    id: 'landuse-green',
    type: 'fill',
    ...fromTiles('landuse'),
    filter: isOneOf('class', ['cemetery', 'pitch', 'stadium', 'playground', 'garden']),
    paint: { 'fill-color': colours.park, 'fill-opacity': 0.85 }
  }
];

const landCovers: FillLayerSpecification[] = [
  {
    id: 'landcover',
    type: 'fill',
    ...fromTiles('landcover'),
    filter: isOneOf('class', ['grass', 'wood', 'farmland', 'wetland']),
    paint: { 'fill-color': ['match', ['get', 'class'], 'wood', colours.wood, colours.park] }
  },
  { id: 'park', type: 'fill', ...fromTiles('park'), paint: { 'fill-color': colours.park } }
];

const landLayers: (BackgroundLayerSpecification | FillLayerSpecification)[] = [land, ...landUses, ...landCovers];

export { landLayers };
