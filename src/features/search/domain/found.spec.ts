import { describe, expect, it } from 'vitest';
import { isAddress } from './found';

describe('a result found', () => {
  it('is an address when it is of an address kind', () => {
    expect(isAddress({ kind: 'street' })).toBe(true);
  });

  it('is not an address when it is a place', () => {
    expect(isAddress({ kind: 'museum' })).toBe(false);
  });
});
