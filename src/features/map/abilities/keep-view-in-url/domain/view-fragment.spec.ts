import { describe, expect, it } from 'vitest';
import { fragmentOfView, type MapView, viewOfFragment } from './view-fragment';

const EIFFEL_TOWER: MapView = { center: { longitude: 2.294_48, latitude: 48.858_37 }, zoom: 17 };

describe('view of a fragment', () => {
  it('reads the zoom, the latitude and the longitude of the map key', () => {
    expect(viewOfFragment('map=17/48.85837/2.29448')).toEqual(EIFFEL_TOWER);
  });

  it('reads a view among other keys', () => {
    expect(viewOfFragment('place=node/1&map=17/48.85837/2.29448')).toEqual(EIFFEL_TOWER);
  });

  it('reads a fractional zoom and a view south and west of Greenwich', () => {
    expect(viewOfFragment('map=12.5/-33.9/-70.6')).toEqual({ center: { longitude: -70.6, latitude: -33.9 }, zoom: 12.5 });
  });

  it('reads the widest view, at zoom 0 on the south-west corner of the world', () => {
    expect(viewOfFragment('map=0/-90/-180')).toEqual({ center: { longitude: -180, latitude: -90 }, zoom: 0 });
  });

  it('reads the closest view, at zoom 22 on the north-east corner of the world', () => {
    expect(viewOfFragment('map=22/90/180')).toEqual({ center: { longitude: 180, latitude: 90 }, zoom: 22 });
  });
});

describe('view of a malformed fragment', () => {
  it('finds no view in an empty fragment', () => {
    expect(viewOfFragment('')).toBeUndefined();
  });

  it('finds no view under another key', () => {
    expect(viewOfFragment('carte=17/48.85837/2.29448')).toBeUndefined();
  });

  it('finds no view when a part is missing', () => {
    expect(viewOfFragment('map=17/48.85837')).toBeUndefined();
  });

  it('finds no view when there are more than three parts', () => {
    expect(viewOfFragment('map=17/48.85837/2.29448/30')).toBeUndefined();
  });

  it('finds no view when a part is empty', () => {
    expect(viewOfFragment('map=17//2.29448')).toBeUndefined();
  });

  it('finds no view when a part is not a number', () => {
    expect(viewOfFragment('map=17/abc/2.29448')).toBeUndefined();
  });

  it('finds no view when a part is written in exponent notation', () => {
    expect(viewOfFragment('map=1e1/48.85837/2.29448')).toBeUndefined();
  });

  it('finds no view when a part starts with a sign other than minus', () => {
    expect(viewOfFragment('map=%2B17/48.85837/2.29448')).toBeUndefined();
  });

  it('finds no view when a part ends with a decimal point', () => {
    expect(viewOfFragment('map=17./48.85837/2.29448')).toBeUndefined();
  });
});

describe('view of a fragment beyond what the map can show', () => {
  it('finds no view below zoom 0', () => {
    expect(viewOfFragment('map=-1/48.85837/2.29448')).toBeUndefined();
  });

  it('finds no view beyond zoom 22', () => {
    expect(viewOfFragment('map=22.01/48.85837/2.29448')).toBeUndefined();
  });

  it('finds no view south of the South Pole', () => {
    expect(viewOfFragment('map=17/-90.01/2.29448')).toBeUndefined();
  });

  it('finds no view north of the North Pole', () => {
    expect(viewOfFragment('map=17/90.01/2.29448')).toBeUndefined();
  });

  it('finds no view west of the antimeridian', () => {
    expect(viewOfFragment('map=17/48.85837/-180.01')).toBeUndefined();
  });

  it('finds no view east of the antimeridian', () => {
    expect(viewOfFragment('map=17/48.85837/180.01')).toBeUndefined();
  });
});

describe('fragment of a view', () => {
  it('writes the zoom, the latitude and the longitude under the map key', () => {
    expect(fragmentOfView(EIFFEL_TOWER)).toBe('map=17/48.85837/2.29448');
  });

  it('rounds the zoom to two decimals', () => {
    expect(fragmentOfView({ center: { longitude: 2.3522, latitude: 48.8566 }, zoom: 13.456 })).toBe('map=13.46/48.8566/2.3522');
  });

  it('keeps five decimals of the coordinates at zoom 13, under half a pixel', () => {
    expect(fragmentOfView({ center: { longitude: 2.294_481_234, latitude: 48.858_370_123 }, zoom: 13 })).toBe(
      'map=13/48.85837/2.29448'
    );
  });

  it('keeps one decimal of the coordinates at zoom 0', () => {
    expect(fragmentOfView({ center: { longitude: 2.294_481_234, latitude: 48.858_370_123 }, zoom: 0 })).toBe('map=0/48.9/2.3');
  });

  it('keeps eight decimals of the coordinates at zoom 22', () => {
    expect(fragmentOfView({ center: { longitude: 2.294_481_234, latitude: 48.858_370_123 }, zoom: 22 })).toBe(
      'map=22/48.85837012/2.29448123'
    );
  });

  it('drops the trailing zeros', () => {
    expect(fragmentOfView({ center: { longitude: 2.3, latitude: 48.8 }, zoom: 13 })).toBe('map=13/48.8/2.3');
  });

  it('writes a fragment it reads back', () => {
    expect(viewOfFragment(fragmentOfView({ center: { longitude: -70.6, latitude: -33.9 }, zoom: 12.5 }))).toEqual({
      center: { longitude: -70.6, latitude: -33.9 },
      zoom: 12.5
    });
  });
});
