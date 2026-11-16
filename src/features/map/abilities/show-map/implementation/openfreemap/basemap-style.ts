import type { LayerSpecification, SourceSpecification, StyleSpecification } from '@maplibre/maplibre-gl-style-spec';
import { boundaryLayers } from './style/boundaries';
import { buildingLayers } from './style/buildings';
import type { Palette } from './style/colours';
import { houseNumberLayers } from './style/house-numbers';
import { landLayers } from './style/land';
import { pedestrianAreaLayers, pedestrianWayLayers } from './style/pedestrian';
import { placeLayers } from './style/places';
import { railLayers } from './style/rail';
import { roadNameLayers } from './style/road-names';
import { roadLayers } from './style/roads';
import { stationLayers } from './style/stations';
import { openMapTilesId, openMapTilesSource } from './style/tiles';
import { waterLayers } from './style/water';

type BasemapAssets = {
  readonly glyphs: string;
  readonly sprite: string;
};

type BasemapImagery = {
  readonly sources: Readonly<Record<string, SourceSpecification>>;
  readonly layers: readonly LayerSpecification[];
};

const NO_IMAGERY: BasemapImagery = { sources: {}, layers: [] };

const basemapStyle = (
  { glyphs, sprite }: BasemapAssets,
  palette: Palette,
  imagery: BasemapImagery = NO_IMAGERY
): StyleSpecification => ({
  version: 8,
  glyphs,
  sprite,
  sources: { [openMapTilesId]: openMapTilesSource, ...imagery.sources },
  layers: [
    ...landLayers(palette),
    ...waterLayers(palette),
    ...pedestrianAreaLayers(palette),
    ...buildingLayers(palette),
    ...pedestrianWayLayers(palette),
    ...roadLayers(palette),
    ...railLayers(palette),
    ...boundaryLayers(palette),
    ...imagery.layers,
    ...roadNameLayers(palette),
    ...stationLayers(palette),
    ...placeLayers(palette),
    ...houseNumberLayers(palette)
  ]
});

export { type BasemapAssets, type BasemapImagery, basemapStyle };
