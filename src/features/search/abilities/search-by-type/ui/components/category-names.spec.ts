import { describe, expect, it } from 'vitest';
import { nameOf } from './category-names';

describe('name of a category', () => {
  it('tells the category in words', () => {
    expect(nameOf('bakeries')).toBe('Bakeries');
  });
});
