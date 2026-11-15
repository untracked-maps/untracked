import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec';
import { boundaryLayers } from './style/boundaries';
import { buildingLayers } from './style/buildings';
import { houseNumberLayers } from './style/house-numbers';
import { landLayers } from './style/land';
import { pedestrianAreaLayers, pedestrianWayLayers } from './style/pedestrian';
import { placeLayers } from './style/places';
import { railLayers } from './style/rail';
import { roadNameLayers } from './style/road-names';
import { roadLayers } from './style/roads';
import { openMapTilesId, openMapTilesSource } from './style/tiles';
import { waterLayers } from './style/water';

const basemapStyle = (glyphs: string): StyleSpecification => ({
  version: 8,
  glyphs,
  sources: { [openMapTilesId]: openMapTilesSource },
  layers: [
    ...landLayers,
    ...waterLayers,
    ...pedestrianAreaLayers,
    ...buildingLayers,
    ...pedestrianWayLayers,
    ...roadLayers,
    ...railLayers,
    ...boundaryLayers,
    ...roadNameLayers,
    ...placeLayers,
    ...houseNumberLayers
  ]
});

export { basemapStyle };
