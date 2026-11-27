import { describe, expect, it } from 'vitest';
import { pictureItem } from './picture-item';

describe('the file of a fake picture', () => {
  it('is a STAC item, as the Panoramax service gives', () => {
    expect(
      pictureItem({
        id: 'cafe-de-flore',
        image: 'street-views/cafe-03.svg',
        camera: { longitude: 2.3326, latitude: 48.854 },
        azimuth: 87
      })
    ).toEqual({
      type: 'Feature',
      id: 'cafe-de-flore',
      geometry: { type: 'Point', coordinates: [2.3326, 48.854] },
      properties: { 'view:azimuth': 87 },
      assets: { hd: { href: 'street-views/cafe-03.svg', type: 'image/svg+xml' } }
    });
  });
});
