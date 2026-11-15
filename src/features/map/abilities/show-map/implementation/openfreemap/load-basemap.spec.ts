import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { basemapStyle } from './basemap-style';
import { openFreeMapBasemap } from './load-basemap';

const GLYPHS = 'https://example.org/glyphs/{fontstack}/{range}.pbf';

describe('the OpenFreeMap basemap', () => {
  it('loads the basemap style with the given glyphs', async () => {
    expect(await firstValueFrom(openFreeMapBasemap(GLYPHS)())).toStrictEqual(basemapStyle(GLYPHS));
  });
});
