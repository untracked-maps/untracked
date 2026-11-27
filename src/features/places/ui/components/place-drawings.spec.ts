import { describe, expect, it } from 'vitest';
import { drawingOf } from './place-drawings';

describe('the drawing of a family of places', () => {
  it('gives its colour and pictogram', () => {
    expect(drawingOf('nature').colour).toBe('#3E8E52');
  });
});
