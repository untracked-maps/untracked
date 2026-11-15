import { describe, expect, it } from 'vitest';
import { FONT_STACKS, isFontStack } from './font-stacks';

describe('font stacks', () => {
  it('are the five weights of Inter the map uses', () => {
    expect(FONT_STACKS).toEqual(['Inter Regular', 'Inter Medium', 'Inter SemiBold', 'Inter Bold', 'Inter Italic']);
  });

  it('recognise a stack the map uses', () => {
    expect(isFontStack('Inter Bold')).toBe(true);
  });

  it('reject a stack the map does not use', () => {
    expect(isFontStack('Comic Sans')).toBe(false);
  });
});
