import { describe, expect, it } from 'vitest';
import { basemapPalettes } from './colours';
import { fonts } from './fonts';
import { metroIcon } from './sprite';
import { stationLayers } from './stations';

const LIGHT = basemapPalettes.light;

const DARK = basemapPalettes.dark;

describe('station layers', () => {
  it('marks metro, train and RER stations of the OpenMapTiles points of interest', () => {
    expect(stationLayers(LIGHT)[0]).toHaveProperty('filter', [
      'all',
      ['==', ['get', 'class'], 'railway'],
      ['match', ['get', 'subclass'], ['subway', 'station', 'halt'], true, false]
    ]);
  });

  it('shows stations from zoom 13', () => {
    expect(stationLayers(LIGHT)[0]).toHaveProperty('minzoom', 13);
  });

  it('marks stations with the metro icon of the sprite', () => {
    expect(stationLayers(LIGHT)[0]).toHaveProperty(['layout', 'icon-image'], metroIcon);
  });

  it('names stations from zoom 14.5', () => {
    expect(stationLayers(LIGHT)[0]).toHaveProperty(['layout', 'text-field', 3], 14.5);
  });

  it('writes station names in Inter SemiBold', () => {
    expect(stationLayers(LIGHT)[0]).toHaveProperty(['layout', 'text-font'], fonts.semibold);
  });

  it('writes station names in the colour of the palette', () => {
    expect(stationLayers(DARK)[0]).toHaveProperty(['paint', 'text-color'], DARK.stationLabel);
  });
});
