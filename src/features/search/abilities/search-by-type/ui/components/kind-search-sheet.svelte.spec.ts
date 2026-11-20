import { BehaviorSubject } from 'rxjs';
import type { ComponentProps } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { Place } from '../../../../domain/place';
import type { KindSearch } from '../../domain/search-by-type';
import KindSearchPanel from './kind-search.svelte';

const bakery = (index: number): Place => ({
  id: `bakery-${index}`,
  name: `Boulangerie ${index}`,
  kind: 'bakery',
  address: '97 Rue de Paris, 75019 Paris',
  coordinates: { longitude: 2.35, latitude: 48.86 },
  fame: 0
});

const BAKERIES: KindSearch & { readonly status: 'found' } = {
  status: 'found',
  placeKind: 'bakery',
  places: [bakery(0), ...Array.from({ length: 24 }, (_, index) => bakery(index + 1))]
};

const sheet = (): HTMLElement | null => document.querySelector<HTMLElement>('.sheet');

type Seen = {
  readonly heights: number[];
  readonly search: BehaviorSubject<KindSearch>;
};

const onPhone = async (initial: KindSearch, props: Partial<ComponentProps<typeof KindSearchPanel>> = {}): Promise<Seen> => {
  const heights: number[] = [];
  const search = new BehaviorSubject(initial);
  await page.viewport(390, 844);
  await render(KindSearchPanel, {
    search,
    onChoose: (): void => undefined,
    onChoosePlace: (): void => undefined,
    onSheetHeight: (height: number): void => {
      heights.push(height);
    },
    ...props
  });
  return { heights, search };
};

describe('places of a kind on a phone', () => {
  it('open as a peek of 150 px along the bottom, the map staying visible', async () => {
    await onPhone(BAKERIES);

    await expect.element(sheet()).toHaveStyle({ position: 'fixed', blockSize: '150px' });
  });

  it('build no sheet until a kind is shown, so that the page starts lighter', async () => {
    await onPhone({ status: 'closed' });
    await page.getByRole('button', { name: 'Bakeries' }).hover();

    expect(sheet()).toBeNull();
  });

  it('say in the sheet how many places are listed', async () => {
    await onPhone(BAKERIES);

    expect(sheet()?.querySelector('p')?.textContent).toBe('25 places near the centre of the map, the nearest first.');
  });

  it('can be enlarged with the grip', async () => {
    await onPhone(BAKERIES);

    await expect.element(page.getByRole('button', { name: 'Enlarge the sheet' })).toBeVisible();
  });

  it('can be reduced once full', async () => {
    await onPhone(BAKERIES);
    await page.getByRole('button', { name: 'Enlarge the sheet' }).click();

    await expect.element(page.getByRole('button', { name: 'Reduce the sheet' })).toBeVisible();
  });

  it('go back to a peek when another kind is shown', async () => {
    const { search } = await onPhone(BAKERIES);
    await page.getByRole('button', { name: 'Enlarge the sheet' }).click();
    search.next({ ...BAKERIES, placeKind: 'pharmacy' });

    await expect.element(sheet()).toHaveStyle({ blockSize: '150px' });
  });
});

describe('the sheet of the places of a kind', () => {
  it('hides behind the sheet that covers them', async () => {
    await onPhone(BAKERIES, { covered: true });

    await expect.element(sheet()).toHaveStyle({ visibility: 'hidden' });
  });

  it('show when nothing covers them', async () => {
    await onPhone(BAKERIES);

    await expect.element(sheet()).toHaveStyle({ visibility: 'visible' });
  });

  it('tell the height of their sheet', async () => {
    const { heights } = await onPhone(BAKERIES);

    await expect.poll(() => heights.at(-1)).toBe(150);
  });

  it('are not drawn as a card inside the sheet', async () => {
    await onPhone(BAKERIES);

    await expect.element(page.getByRole('region', { name: 'Bakeries' })).toHaveStyle({ boxShadow: 'none' });
  });

  it('scroll with the sheet rather than on their own', async () => {
    await onPhone(BAKERIES);

    await expect
      .element(page.getByRole('region', { name: 'Bakeries' }).getByRole('list'))
      .toHaveStyle({ overflowY: 'visible' });
  });
});
