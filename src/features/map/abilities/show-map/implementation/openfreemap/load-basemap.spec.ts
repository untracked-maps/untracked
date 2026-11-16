import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { basemapStyle } from './basemap-style';
import { openFreeMapBasemap } from './load-basemap';
import { basemapPalettes } from './style/colours';

const ASSETS = {
  glyphs: 'https://example.org/glyphs/{fontstack}/{range}.pbf',
  sprite: 'https://example.org/sprites/basemap'
};

const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

describe('the OpenFreeMap basemap', () => {
  it('draws the basemap style in each palette it is given, with the given glyphs and sprite', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const basemap$ = openFreeMapBasemap(ASSETS, cold('l-d', { l: basemapPalettes.light, d: basemapPalettes.dark }))();

      expectObservable(basemap$).toBe('l-d', {
        l: basemapStyle(ASSETS, basemapPalettes.light),
        d: basemapStyle(ASSETS, basemapPalettes.dark)
      });
    });
  });
});
