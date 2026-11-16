import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec';
import { map, type Observable } from 'rxjs';
import type { LoadBasemap } from '../../domain/show-map';
import { type BasemapAssets, basemapStyle } from './basemap-style';
import type { Palette } from './style/colours';

const openFreeMapBasemap =
  (assets: BasemapAssets, palette$: Observable<Palette>): LoadBasemap<StyleSpecification> =>
  (): Observable<StyleSpecification> =>
    palette$.pipe(map((palette) => basemapStyle(assets, palette)));

export { openFreeMapBasemap };
