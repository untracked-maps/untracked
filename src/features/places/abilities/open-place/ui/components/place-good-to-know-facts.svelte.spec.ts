import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { SheetPlace } from '../../domain/open-place';
import PlaceGoodToKnow from './place-good-to-know.svelte';

const TICK = 'm5 12.5 4.5 4.5L19 7.5';

const CROSS = 'M7 7l10 10M17 7 7 17';

const procope = (tags: readonly (readonly [string, string])[]): SheetPlace => ({
  id: 'procope',
  name: 'Le Procope',
  kind: 'restaurant',
  tags: Object.fromEntries(tags),
  coordinates: { longitude: 2.3388, latitude: 48.8531 }
});

const PROCOPE = procope([
  ['reservation', 'required'],
  ['outdoor_seating', 'yes'],
  ['payment:contactless', 'yes'],
  ['diet:vegetarian', 'yes'],
  ['internet_access', 'wlan'],
  ['internet_access:fee', 'no']
]);

const items = (): readonly Element[] => [
  ...(page.getByRole('region', { name: 'Good to know' }).query()?.querySelectorAll('li') ?? [])
];

const signOf = (label: string): string | null | undefined =>
  items()
    .find(({ textContent }) => textContent.trim() === label)
    ?.querySelector('path')
    ?.getAttribute('d');

describe('the facts good to know about a place', () => {
  it('are what its tags say, in their order', async () => {
    await render(PlaceGoodToKnow, { place: PROCOPE });

    await expect
      .poll(() => items().map(({ textContent }) => textContent.trim()))
      .toEqual(['Contactless payment', 'Outdoor seating', 'Vegetarian options', 'Reservation required', 'Free Wi-Fi']);
  });

  it('are left out, heading included, when the tags say nothing of the kind', async () => {
    const { container } = await render(PlaceGoodToKnow, { place: procope([['cuisine', 'french']]) });

    expect(container.innerHTML).not.toContain('section');
  });

  it('mark what warns the visitor with a cross', async () => {
    await render(PlaceGoodToKnow, { place: PROCOPE });

    await expect.poll(() => signOf('Reservation required')).toBe(CROSS);
  });

  it('mark what the place offers with a tick', async () => {
    await render(PlaceGoodToKnow, { place: PROCOPE });

    await expect.poll(() => signOf('Outdoor seating')).toBe(TICK);
  });

  it('mark a place without reservation with a tick', async () => {
    await render(PlaceGoodToKnow, { place: procope([['reservation', 'no']]) });

    await expect.poll(() => signOf('No reservations')).toBe(TICK);
  });
});
