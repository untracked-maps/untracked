import type { VectorSourceSpecification } from '@maplibre/maplibre-gl-style-spec';

type TileLayer = {
  readonly source: string;
  readonly 'source-layer': string;
};

const openMapTilesId = 'openmaptiles';

const openMapTilesSource: VectorSourceSpecification = {
  type: 'vector',
  url: 'https://tiles.openfreemap.org/planet',
  attribution: [
    '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a>',
    '<a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a>',
    '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>'
  ].join(' © ')
};

const fromTiles = (sourceLayer: string): TileLayer => ({ source: openMapTilesId, 'source-layer': sourceLayer });

export { fromTiles, openMapTilesId, openMapTilesSource };
