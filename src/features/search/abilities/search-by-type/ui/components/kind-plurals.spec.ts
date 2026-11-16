import { describe, expect, it } from 'vitest';
import { pluralOf } from './kind-plurals';

describe('plural of a kind', () => {
  it('names the places of the kind', () => {
    expect(pluralOf('place-of-worship')).toBe('Places of worship');
  });
});
