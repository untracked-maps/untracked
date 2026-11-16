import type { GeoJSONSourceSpecification, LineLayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import type { TransitLine } from '../../domain/show-transit-lines';
import { TRANSIT_LINES_SOURCE, transitLinesStyle } from './transit-lines-style';

type TransitLinesLayers = {
  readonly sources: Readonly<Record<string, GeoJSONSourceSpecification>>;
  readonly layers: readonly LineLayerSpecification[];
};

type LinesData = Extract<GeoJSONSourceSpecification['data'], { readonly type: 'FeatureCollection' }>;

const featureOf = ({ mode, colour, path }: TransitLine): LinesData['features'][number] => ({
  type: 'Feature',
  geometry: { type: 'LineString', coordinates: path.map(([longitude, latitude]) => [longitude, latitude]) },
  properties: colour === undefined ? { mode } : { mode, colour }
});

const transitLinesLayers = (lines: readonly TransitLine[]): TransitLinesLayers => ({
  sources: { [TRANSIT_LINES_SOURCE]: { type: 'geojson', data: { type: 'FeatureCollection', features: lines.map(featureOf) } } },
  layers: transitLinesStyle
});

export { type TransitLinesLayers, transitLinesLayers };
