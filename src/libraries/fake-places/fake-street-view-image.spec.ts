import { describe, expect, it } from 'vitest';
import { fakeStreetViewImage } from './fake-street-view-image';

const DRAWING = { colour: '#808080', pictogram: 'M0 0h32v32H0z' };

const SIZED = /^<svg [^>]*viewBox="0 0 2000 1000" width="2000" height="1000">/u;

const ROOFS = /<rect x="-?\d+" y="(?<roof>\d+)" width="250" height="\d+" fill="#[0-9a-f]{6}"\/>/gu;

const roofsOf = (shade: number): readonly string[] =>
  [...fakeStreetViewImage(DRAWING, shade).matchAll(ROOFS)].map((match) => match.groups?.['roof'] ?? '');

describe('a fake street view', () => {
  it('is twice as wide as high, as a 360° picture is', () => {
    expect(fakeStreetViewImage(DRAWING, 1)).toMatch(SIZED);
  });

  it('is closed', () => {
    expect(fakeStreetViewImage(DRAWING, 1).endsWith('</svg>')).toBe(true);
  });

  it('shows a sky', () => {
    expect(fakeStreetViewImage(DRAWING, 1)).toContain('<rect width="2000" height="1000" fill="#cfe3f2"/>');
  });
});

describe('the buildings of a fake street view', () => {
  it('are nine side by side side by side, the first and the last cut by the edges', () => {
    expect(roofsOf(1)).toHaveLength(9);
  });

  it('start across the left edge', () => {
    expect(fakeStreetViewImage(DRAWING, 1)).toContain('<rect x="-125" y="287" width="250" height="353" fill="#d9cbb5"/>');
  });

  it('end across the right edge', () => {
    expect(fakeStreetViewImage(DRAWING, 1)).toContain('<rect x="1875" y="311" width="250" height="329" fill="#d9cbb5"/>');
  });

  it('have roofs of their own in each shade', () => {
    expect(roofsOf(2)).not.toEqual(roofsOf(1));
  });

  it('keep their roofs above the shop fronts', () => {
    expect(Math.max(...roofsOf(5).map(Number))).toBeLessThan(410);
  });
});

describe('the street of a fake street view', () => {
  it('draws the front of the place in the middle, in the shade of its family', () => {
    expect(fakeStreetViewImage(DRAWING, 1)).toContain('<rect x="889" y="410" width="222" height="230" fill="#5a5a5a"/>');
  });

  it('draws the pictogram of the family in white', () => {
    expect(fakeStreetViewImage(DRAWING, 1)).toContain(`d="${DRAWING.pictogram}" fill="#ffffff" fill-opacity="0.92"`);
  });

  it('draws the pictogram in the middle of the front', () => {
    expect(fakeStreetViewImage(DRAWING, 1)).toContain('translate(930 455)');
  });

  it('draws the pictogram 140 px wide', () => {
    expect(fakeStreetViewImage(DRAWING, 1)).toContain('scale(4.375)');
  });

  it('draws the pavement', () => {
    expect(fakeStreetViewImage(DRAWING, 1)).toContain('<rect y="640" width="2000" height="360" fill="#a9a9a9"/>');
  });

  it('draws the road', () => {
    expect(fakeStreetViewImage(DRAWING, 1)).toContain('<rect y="800" width="2000" height="200" fill="#6b6b6b"/>');
  });
});
