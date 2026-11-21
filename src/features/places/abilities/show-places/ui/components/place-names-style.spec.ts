import { describe, expect, it } from 'vitest';
import { placeDotsLayers } from './place-dots-style';

const [, WITH_FAMILY] = placeDotsLayers('light');

const [, WITH_FAMILY_IN_THE_DARK] = placeDotsLayers('dark');

describe('the name of a place with a family', () => {
  it('is the name of the place', () => {
    expect(WITH_FAMILY).toHaveProperty(['layout', 'text-field'], ['get', 'name']);
  });

  it('is written in Inter SemiBold', () => {
    expect(WITH_FAMILY).toHaveProperty(['layout', 'text-font'], ['Inter SemiBold']);
  });

  it('grows from 10.5 at zoom 11.5 to 11.5 at zoom 14 and 12 from zoom 16', () => {
    expect(WITH_FAMILY).toHaveProperty(
      ['layout', 'text-size'],
      ['interpolate', ['exponential', 1.5], ['zoom'], 11.5, 10.5, 14, 11.5, 16, 12]
    );
  });

  it('starts on the right of the dot', () => {
    expect(WITH_FAMILY).toHaveProperty(['layout', 'text-anchor'], 'left');
  });

  it('has its lines aligned on the left', () => {
    expect(WITH_FAMILY).toHaveProperty(['layout', 'text-justify'], 'left');
  });

  it('starts 1 em from the centre of the dot', () => {
    expect(WITH_FAMILY).toHaveProperty(['layout', 'text-offset'], [1, 0]);
  });

  it('is 8 em wide at most', () => {
    expect(WITH_FAMILY).toHaveProperty(['layout', 'text-max-width'], 8);
  });

  it('has lines 1.1 em high, and 1.15 em from zoom 17', () => {
    expect(WITH_FAMILY).toHaveProperty(['layout', 'text-line-height'], ['step', ['zoom'], 1.1, 17, 1.15]);
  });
});

describe('the colour of the name of a place', () => {
  it('is the colour of its family', () => {
    expect(WITH_FAMILY).toHaveProperty(
      ['paint', 'text-color'],
      [
        'get',
        ['get', 'family'],
        [
          'literal',
          {
            food: '#b55a25',
            cafe: '#b55a25',
            bar: '#b55a25',
            bakery: '#b55a25',
            shop: '#3253AA',
            culture: '#0E7681',
            sight: '#0E7681',
            nature: '#2F6E3F',
            health: '#A8392F',
            stay: '#78427d',
            money: '#3e5f53',
            fuel: '#3e577d',
            train: '#2B4793',
            none: '#5F656C'
          }
        ]
      ]
    );
  });

  it('is lighter in the dark palette, for banks and fuel stations too', () => {
    expect(WITH_FAMILY_IN_THE_DARK).toHaveProperty(
      ['paint', 'text-color'],
      [
        'get',
        ['get', 'family'],
        [
          'literal',
          {
            food: '#F0A06A',
            cafe: '#F0A06A',
            bar: '#F0A06A',
            bakery: '#F0A06A',
            shop: '#8FA8F0',
            culture: '#5FC6D0',
            sight: '#5FC6D0',
            nature: '#7CC48D',
            health: '#F08A85',
            stay: '#D29AD6',
            money: '#8CC3AE',
            fuel: '#9DB6E0',
            train: '#9DB2F2',
            none: '#AEB3B9'
          }
        ]
      ]
    );
  });

  it('stands on a white halo of 1.6 pixels', () => {
    expect(WITH_FAMILY?.paint).toMatchObject({ 'text-halo-color': '#FFFFFF', 'text-halo-width': 1.6 });
  });

  it('stands on a dark halo in the dark palette', () => {
    expect(WITH_FAMILY_IN_THE_DARK).toHaveProperty(['paint', 'text-halo-color'], 'rgba(22,24,28,0.9)');
  });
});
