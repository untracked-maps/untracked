import { describe, expect, it } from 'vitest';
import { FAKE_ZONE } from './fake-zone';

describe('fake zone', () => {
  it('generates the fake places in Paris', () => {
    expect(FAKE_ZONE.city).toBe('Paris');
  });
});
