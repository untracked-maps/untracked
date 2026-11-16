import { describe, expect, it } from 'vitest';
import { fakeParis } from './fake-paris';

describe('fake Paris', () => {
  it('starts with the landmarks', () => {
    expect(fakeParis()[0]?.id).toBe('tour-eiffel');
  });

  it('holds two thousand generated places after the landmarks', () => {
    expect(fakeParis().filter(({ id }) => id.startsWith('fake-paris-'))).toHaveLength(2000);
  });

  it('gives each place its own id', () => {
    expect(new Set(fakeParis().map(({ id }) => id)).size).toBe(fakeParis().length);
  });
});
