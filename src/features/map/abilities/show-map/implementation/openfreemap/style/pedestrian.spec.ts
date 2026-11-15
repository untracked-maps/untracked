import { describe, expect, it } from 'vitest';
import { pedestrianAreaLayers, pedestrianWayLayers } from './pedestrian';

describe('pedestrian layers', () => {
  it('fills pedestrian areas from zoom 15', () => {
    expect(pedestrianAreaLayers[0]).toHaveProperty('minzoom', 15);
  });

  it('draws pedestrian streets before paths', () => {
    expect(pedestrianWayLayers.map(({ id }) => id)).toStrictEqual(['pedestrian-street', 'path']);
  });

  it('dashes paths', () => {
    expect(pedestrianWayLayers[1]).toHaveProperty(['paint', 'line-dasharray'], [2.5, 2]);
  });
});
