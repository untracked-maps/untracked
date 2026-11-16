import { describe, expect, it } from 'vitest';
import { metroIcon } from './sprite';
import { basemapSprite } from './sprite-icons';

describe('basemap sprite', () => {
  it('holds the metro station icon', () => {
    expect(basemapSprite.icons.map(({ id }) => id)).toContain(metroIcon);
  });
});
