import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { basemapStyle } from './basemap-style';
import { openFreeMapBasemap } from './load-basemap';
import { basemapPalettes } from './style/colours';

const GLYPHS = 'https://example.org/glyphs/{fontstack}/{range}.pbf';

const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

describe('the OpenFreeMap basemap', () => {
  it('draws the basemap style in each palette it is given, with the given glyphs', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const basemap$ = openFreeMapBasemap(GLYPHS, cold('l-d', { l: basemapPalettes.light, d: basemapPalettes.dark }))();

      expectObservable(basemap$).toBe('l-d', {
        l: basemapStyle(GLYPHS, basemapPalettes.light),
        d: basemapStyle(GLYPHS, basemapPalettes.dark)
      });
    });
  });
});
