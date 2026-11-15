import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec';
import { type Observable, of } from 'rxjs';
import type { LoadBasemap } from '../../domain/show-map';
import { basemapStyle } from './basemap-style';

const openFreeMapBasemap =
  (glyphs: string): LoadBasemap<StyleSpecification> =>
  (): Observable<StyleSpecification> =>
    of(basemapStyle(glyphs));

export { openFreeMapBasemap };
