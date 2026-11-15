import { describe, expect, it } from 'vitest';
import { basemapPalettes } from './colours';
import { pedestrianAreaLayers, pedestrianWayLayers } from './pedestrian';

const LIGHT = basemapPalettes.light;

describe('pedestrian layers', () => {
  it('fills pedestrian areas from zoom 15', () => {
    expect(pedestrianAreaLayers(LIGHT)[0]).toHaveProperty('minzoom', 15);
  });

  it('draws pedestrian streets before paths', () => {
    expect(pedestrianWayLayers(LIGHT).map(({ id }) => id)).toStrictEqual(['pedestrian-street', 'path']);
  });

  it('dashes paths', () => {
    expect(pedestrianWayLayers(LIGHT)[1]).toHaveProperty(['paint', 'line-dasharray'], [2.5, 2]);
  });
});
