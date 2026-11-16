import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec';
import { combineLatest, map, type Observable, of } from 'rxjs';
import type { LoadBasemap } from '../../domain/show-map';
import { type BasemapAssets, type BasemapImagery, basemapStyle } from './basemap-style';
import type { Palette } from './style/colours';

const openFreeMapBasemap =
  (
    assets: BasemapAssets,
    palette$: Observable<Palette>,
    imagery$: Observable<BasemapImagery | undefined> = of(undefined)
  ): LoadBasemap<StyleSpecification> =>
  (): Observable<StyleSpecification> =>
    combineLatest([palette$, imagery$]).pipe(map(([palette, imagery]) => basemapStyle(assets, palette, imagery)));

export { openFreeMapBasemap };
