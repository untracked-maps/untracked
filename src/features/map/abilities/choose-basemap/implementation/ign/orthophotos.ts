import type { RasterLayerSpecification, RasterSourceSpecification } from '@maplibre/maplibre-gl-style-spec';

type Orthophotos = {
  readonly sources: Readonly<Record<string, RasterSourceSpecification>>;
  readonly layers: readonly RasterLayerSpecification[];
};

const WMTS_TILE = new URLSearchParams([
  ['SERVICE', 'WMTS'],
  ['REQUEST', 'GetTile'],
  ['VERSION', '1.0.0'],
  ['LAYER', 'ORTHOIMAGERY.ORTHOPHOTOS'],
  ['STYLE', 'normal'],
  ['TILEMATRIXSET', 'PM'],
  ['FORMAT', 'image/jpeg']
]);

const ORTHOPHOTOS_TILES = `https://data.geopf.fr/wmts?${WMTS_TILE}&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`;

const orthophotos: Orthophotos = {
  sources: { 'ign-orthophotos': { type: 'raster', tiles: [ORTHOPHOTOS_TILES], tileSize: 256, maxzoom: 19 } },
  layers: [{ id: 'ign-orthophotos', type: 'raster', source: 'ign-orthophotos' }]
};

export { type Orthophotos, orthophotos };
