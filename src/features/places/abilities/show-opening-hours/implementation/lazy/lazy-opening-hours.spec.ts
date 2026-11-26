import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { lazyOpeningHours } from './lazy-opening-hours';

describe('opening hours read by a library loaded on demand', () => {
  it('reads the opening hours of a place', async () => {
    const reader = await firstValueFrom(lazyOpeningHours());

    expect(
      reader.readOpeningHours(
        '24/7',
        { coordinates: { longitude: 2.35, latitude: 48.85 }, country: { code: 'FR', region: 'Île-de-France' } },
        Date.now()
      )
    ).toBeDefined();
  });
});
