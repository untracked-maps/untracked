import { describe, expect, it } from 'vitest';
import { FAKE_STATIONS } from './fake-stations';

describe('fake stations', () => {
  it('are the famous stations of Paris', () => {
    expect(FAKE_STATIONS.map(({ id }) => id)).toContain('gare-du-nord');
  });
});
