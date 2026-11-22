import { firstValueFrom, of, ReplaySubject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { type Locator, page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { RecentPlace, RecentPlaces } from '../../domain/recent-searches';
import RecentSearches from './recent-searches.svelte';

const LOUVRE: RecentPlace = {
  id: 'musee-du-louvre',
  name: 'Musée du Louvre',
  kind: 'museum',
  address: { street: 'Rue de Rivoli', postalCode: '75001', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: { longitude: 2.337_64, latitude: 48.860_61 }
};

const GARE_DE_LYON: RecentPlace = {
  id: 'gare-de-lyon',
  name: 'Gare de Lyon',
  kind: 'station',
  address: { street: 'Place Louis-Armand', postalCode: '75012', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: { longitude: 2.373_01, latitude: 48.844_34 }
};

type Seen = {
  readonly chosen: ReplaySubject<RecentPlace>;
  readonly cleared: ReplaySubject<true>;
};

const shown = async (recents: RecentPlaces = [GARE_DE_LYON, LOUVRE]): Promise<Seen> => {
  const seen: Seen = { chosen: new ReplaySubject(1), cleared: new ReplaySubject(1) };
  await render(RecentSearches, {
    recents: of(recents),
    onChoose: (recent: RecentPlace) => seen.chosen.next(recent),
    onClear: () => seen.cleared.next(true)
  });
  return seen;
};

const LOUVRE_BUTTON = /^Musée du Louvre/u;

const recentSearches = (): Locator => page.getByRole('region', { name: 'Recent' });

describe('recent searches', () => {
  it('are listed under their heading', async () => {
    await shown();

    await expect.element(recentSearches()).toBeVisible();
  });

  it('show nothing while there is none', async () => {
    await shown([]);

    await expect.element(recentSearches()).not.toBeInTheDocument();
  });

  it('list the most recent first', async () => {
    await shown();

    await expect
      .element(recentSearches().getByRole('list'))
      .toHaveTextContent(
        'Gare de Lyon Station · Place Louis-Armand, 75012 Paris Musée du Louvre Museum · Rue de Rivoli, 75001 Paris'
      );
  });

  it('tell the kind and the address of each place', async () => {
    await shown();

    await expect
      .element(page.getByRole('button', { name: LOUVRE_BUTTON }))
      .toHaveTextContent('Musée du Louvre Museum · Rue de Rivoli, 75001 Paris');
  });

  it('pass on the place chosen', async () => {
    const { chosen } = await shown();

    await page.getByRole('button', { name: LOUVRE_BUTTON }).click();

    expect(await firstValueFrom(chosen)).toBe(LOUVRE);
  });

  it('can be cleared', async () => {
    const { cleared } = await shown();

    await page.getByRole('button', { name: 'Clear' }).click();

    expect(await firstValueFrom(cleared)).toBe(true);
  });
});
