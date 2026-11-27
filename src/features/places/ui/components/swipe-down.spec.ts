import { describe, expect, it } from 'vitest';
import { closesAfter, dropOf, fadeAfter, swipeOf, touchPoints } from './swipe-down';

const FROM = { x: 100, y: 100 };

describe('a swipe', () => {
  it.each([
    { what: 'still', to: { x: 100, y: 100 }, swipe: 'undecided' },
    { what: '12 px down', to: { x: 100, y: 112 }, swipe: 'undecided' },
    { what: '12 px up', to: { x: 100, y: 88 }, swipe: 'undecided' },
    { what: '12 px aside', to: { x: 112, y: 100 }, swipe: 'undecided' },
    { what: '12 px back', to: { x: 88, y: 100 }, swipe: 'undecided' },
    { what: '13 px down', to: { x: 100, y: 113 }, swipe: 'dropping' },
    { what: '13 px aside', to: { x: 113, y: 100 }, swipe: 'scrolling' },
    { what: '13 px back', to: { x: 87, y: 100 }, swipe: 'scrolling' },
    { what: '13 px up', to: { x: 100, y: 87 }, swipe: 'scrolling' },
    { what: 'down, 1.3 times more than aside', to: { x: 110, y: 113 }, swipe: 'scrolling' },
    { what: 'down, a little more than 1.3 times aside', to: { x: 110, y: 113.1 }, swipe: 'dropping' },
    { what: 'down, a little more than 1.3 times back', to: { x: 90, y: 113.1 }, swipe: 'dropping' },
    { what: 'down, 1.3 times more than back', to: { x: 90, y: 113 }, swipe: 'scrolling' }
  ] as const)('is $swipe when $what', ({ to, swipe }) => {
    expect(swipeOf(FROM, to)).toBe(swipe);
  });
});

describe('a drop', () => {
  it('is how far the finger went down', () => {
    expect(dropOf(FROM, { x: 140, y: 160 })).toBe(60);
  });

  it('is none when the finger went up', () => {
    expect(dropOf(FROM, { x: 100, y: 40 })).toBe(0);
  });

  it.each([
    { drop: 110, closes: false },
    { drop: 111, closes: true }
  ])('closes after $drop px: $closes', ({ drop, closes }) => {
    expect(closesAfter(drop)).toBe(closes);
  });

  it.each([
    { drop: 0, fade: 1 },
    { drop: 250, fade: 0.5 },
    { drop: 350, fade: 0.3 },
    { drop: 400, fade: 0.3 }
  ])('fades to $fade after $drop px', ({ drop, fade }) => {
    expect(fadeAfter(drop)).toBeCloseTo(fade, 10);
  });
});

describe('the points of a touch', () => {
  it('are where each finger is, in order', () => {
    expect(
      touchPoints([
        { clientX: 10, clientY: 20 },
        { clientX: 30, clientY: 40 }
      ])
    ).toEqual([
      { x: 10, y: 20 },
      { x: 30, y: 40 }
    ]);
  });
});
