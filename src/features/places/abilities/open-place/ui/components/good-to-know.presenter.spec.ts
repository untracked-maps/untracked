import { describe, expect, it } from 'vitest';
import { labelOf } from './good-to-know.presenter';

describe('label of a fact good to know', () => {
  it('tells the fact in words', () => {
    expect(labelOf('terrace')).toBe('Outdoor seating');
  });
});
