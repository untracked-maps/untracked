import { describe, expect, it } from 'vitest';
import { colours } from './colours';
import { landLayers } from './land';

describe('land layers', () => {
  it('stacks land, land uses, land cover and parks', () => {
    expect(landLayers.map(({ id }) => id)).toStrictEqual(['land', 'landuse-alt', 'landuse-green', 'landcover', 'park']);
  });

  it('lightens the land when seen from afar', () => {
    expect(landLayers[0]).toHaveProperty(['paint', 'background-color', 4], colours.landFar);
  });

  it('shows commercial and public land uses from zoom 12', () => {
    expect(landLayers[1]).toHaveProperty('minzoom', 12);
  });

  it('paints woods darker than other land cover', () => {
    expect(landLayers[3]).toHaveProperty(
      ['paint', 'fill-color'],
      ['match', ['get', 'class'], 'wood', colours.wood, colours.park]
    );
  });
});
