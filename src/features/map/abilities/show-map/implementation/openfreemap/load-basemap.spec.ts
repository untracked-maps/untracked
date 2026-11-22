import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { basemapStyle } from './basemap-style';
import { openFreeMapBasemap } from './load-basemap';
import { basemapPalettes } from './style/colours';

const SITE = { origin: 'https://example.org', basePath: '/untracked/' };

const ASSETS = {
  glyphs: 'https://example.org/untracked/glyphs/{fontstack}/{range}.pbf',
  sprite: 'https://example.org/untracked/sprites/basemap'
};

const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

describe('the OpenFreeMap basemap', () => {
  it('draws the basemap style in each palette it is given, with the glyphs and sprite of the site', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const basemap$ = openFreeMapBasemap(SITE, cold('l-d', { l: basemapPalettes.light, d: basemapPalettes.dark }))();

      expectObservable(basemap$).toBe('l-d', {
        l: basemapStyle(ASSETS, basemapPalettes.light),
        d: basemapStyle(ASSETS, basemapPalettes.dark)
      });
    });
  });

  it('draws the imagery it is given, under the labels', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const imagery = { sources: {}, layers: [{ id: 'photos', type: 'raster', source: 'photos' }] } as const;
      const basemap$ = openFreeMapBasemap(
        SITE,
        cold('l', { l: basemapPalettes.light }),
        cold('n-i', { n: undefined, i: imagery })
      )();

      expectObservable(basemap$).toBe('n-i', {
        n: basemapStyle(ASSETS, basemapPalettes.light),
        i: basemapStyle(ASSETS, basemapPalettes.light, imagery)
      });
    });
  });
});
