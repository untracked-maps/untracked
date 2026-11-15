import { describe, expect, it } from 'vitest';
import { cameraOf, viewOf } from './camera.presenter';

describe('camera presenter', () => {
  it('turns a view into the camera MapLibre expects, longitude first', () => {
    expect(cameraOf({ center: { longitude: 2.3522, latitude: 48.8566 }, zoom: 13 })).toEqual({
      center: [2.3522, 48.8566],
      zoom: 13
    });
  });

  it('turns the centre and zoom of MapLibre back into a view', () => {
    expect(viewOf({ lng: 2.3522, lat: 48.8566 }, 13)).toEqual({ center: { longitude: 2.3522, latitude: 48.8566 }, zoom: 13 });
  });
});
