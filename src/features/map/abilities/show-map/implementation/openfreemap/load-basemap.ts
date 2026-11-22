import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec';
import { combineLatest, map, type Observable, of } from 'rxjs';
import type { LoadBasemap } from '../../domain/show-map';
import { type BasemapAssets, type BasemapImagery, basemapStyle } from './basemap-style';
import type { Palette } from './style/colours';
import { basemapSpriteName } from './style/sprite';

type Site = {
  readonly origin: string;
  readonly basePath: string;
};

const assetsOf = ({ origin, basePath }: Site): BasemapAssets => ({
  glyphs: `${origin}${basePath}glyphs/{fontstack}/{range}.pbf`,
  sprite: `${origin}${basePath}sprites/${basemapSpriteName}`
});

const openFreeMapBasemap =
  (
    site: Site,
    palette$: Observable<Palette>,
    imagery$: Observable<BasemapImagery | undefined> = of(undefined)
  ): LoadBasemap<StyleSpecification> =>
  (): Observable<StyleSpecification> =>
    combineLatest([palette$, imagery$]).pipe(map(([palette, imagery]) => basemapStyle(assetsOf(site), palette, imagery)));

export { openFreeMapBasemap };
