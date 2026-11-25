import type { LayerSpecification, SourceSpecification } from 'maplibre-gl';
import type { KnownOutline } from '../../domain/open-district';

type DistrictOutlineLayers = {
  readonly sources: Readonly<Record<string, SourceSpecification>>;
  readonly layers: readonly LayerSpecification[];
};

const OUTLINE_ID = 'open-district-outline';

const OUTLINE_WIDTH = 2;

const DASH_PIXELS = 2;

const GAP_PIXELS = 3;

const DASH_WIDTHS = DASH_PIXELS / OUTLINE_WIDTH;

const GAP_WIDTHS = GAP_PIXELS / OUTLINE_WIDTH;

const OUTLINE_OPACITY = 0.8;

const districtOutlineLayers = (outline: KnownOutline['outline']): Promise<DistrictOutlineLayers> =>
  Promise.resolve({
    sources: {
      [OUTLINE_ID]: {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: [outline.map(({ longitude, latitude }) => [longitude, latitude])] }
        }
      }
    },
    layers: [
      {
        id: OUTLINE_ID,
        type: 'line',
        source: OUTLINE_ID,
        layout: { 'line-join': 'round' },
        paint: {
          'line-color': '#D93A2F',
          'line-width': OUTLINE_WIDTH,
          'line-dasharray': [DASH_WIDTHS, GAP_WIDTHS],
          'line-opacity': OUTLINE_OPACITY
        }
      }
    ]
  });

export { districtOutlineLayers };
