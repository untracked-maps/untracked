import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { SheetPlace } from '../../domain/open-place';
import PlaceGoodToKnow from './place-good-to-know.svelte';

const FLORE: SheetPlace = {
  id: 'flore',
  name: 'Café de Flore',
  tags: Object.fromEntries([
    ['outdoor_seating', 'yes'],
    ['payment:contactless', 'yes'],
    ['dog', 'no'],
    ['internet_access', 'wlan'],
    ['internet_access:fee', 'no']
  ]),
  coordinates: { longitude: 2.332_63, latitude: 48.854_04 }
};

const shown = async (place: SheetPlace): Promise<void> => {
  await render(PlaceGoodToKnow, { place });
};

const goodToKnow = (): ReturnType<typeof page.getByRole> => page.getByRole('region', { name: 'Good to know' });

const items = (): readonly Element[] => [...(goodToKnow().query()?.querySelectorAll('li') ?? [])];

const styleOf = (element: Element | null | undefined): CSSStyleDeclaration | undefined =>
  element === null || element === undefined ? undefined : getComputedStyle(element);

const list = (): Element | null | undefined => goodToKnow().query()?.querySelector('ul');

const columnsOf = (element: Element | null | undefined): readonly boolean[] => {
  const [first = '', ...others] = styleOf(element)?.gridTemplateColumns.split(' ') ?? [];
  return [first, ...others].map((width) => width === first && width !== '0px');
};

const LONGEST: SheetPlace = {
  id: 'vert-galant',
  name: 'Square du Vert-Galant',
  coordinates: { longitude: 2.341, latitude: 48.857 },
  tags: Object.fromEntries([
    ['payment:cards', 'no'],
    ['diet:gluten_free', 'yes'],
    ['reservation', 'recommended'],
    ['changing_table', 'yes']
  ])
};

const overflowing = (): readonly string[] =>
  items()
    .filter((item) => item.scrollWidth > item.clientWidth)
    .map(({ textContent }) => textContent.trim());

describe('the section good to know', () => {
  it('stands 22 px under what precedes it', async () => {
    await shown(FLORE);

    await expect.poll(() => styleOf(goodToKnow().query())?.marginBlockStart).toBe('22px');
  });

  it('has a heading of 17 px', async () => {
    await shown(FLORE);

    await expect.poll(() => styleOf(goodToKnow().query()?.querySelector('h3'))?.fontSize).toBe('17px');
  });

  it('has its heading 8 px above the block', async () => {
    await shown(FLORE);

    await expect.poll(() => styleOf(goodToKnow().query()?.querySelector('h3'))?.marginBlockEnd).toBe('8px');
  });
});

describe('the block of good to know', () => {
  it('lists without bullets', async () => {
    await shown(FLORE);

    await expect.poll(() => styleOf(list())?.listStyleType).toBe('none');
  });

  it('pads its block by 12 and 14 px', async () => {
    await shown(FLORE);

    await expect.poll(() => styleOf(list())?.padding).toBe('12px 14px');
  });

  it('sets its facts in two equal columns', async () => {
    await shown(FLORE);

    await expect.poll(() => columnsOf(list())).toEqual([true, true]);
  });

  it('spaces its facts by 8 px down and 12 px across', async () => {
    await shown(FLORE);

    await expect.poll(() => styleOf(list())?.gap).toBe('8px 12px');
  });

  it('lays its block on light grey', async () => {
    await shown(FLORE);

    await expect.poll(() => styleOf(list())?.backgroundColor).toBe('rgb(243, 243, 245)');
  });

  it('rounds its block by 14 px', async () => {
    await shown(FLORE);

    await expect.poll(() => styleOf(list())?.borderRadius).toBe('14px');
  });

  it('writes its facts at 14.5 px', async () => {
    await shown(FLORE);

    await expect.poll(() => styleOf(list())?.fontSize).toBe('14.5px');
  });

  it('keeps the text in its usual colour', async () => {
    await shown(FLORE);

    await expect.poll(() => styleOf(list()?.querySelector('li'))?.color).toBe('rgb(28, 29, 31)');
  });

  it('wraps a long fact within its column, on the narrowest screen', async () => {
    await page.viewport(312, 640);
    await shown(LONGEST);

    await expect.poll(overflowing).toEqual([]);
  });
});

describe('the signs of good to know', () => {
  it('draws signs of 16 px', async () => {
    await shown(FLORE);

    await expect.poll(() => list()?.querySelector('svg')?.getBoundingClientRect().width).toBe(16);
  });

  it('draws signs with a stroke of 2.4', async () => {
    await shown(FLORE);

    await expect.poll(() => styleOf(list()?.querySelector('svg'))?.strokeWidth).toBe('2.4px');
  });

  it('draws signs without fill', async () => {
    await shown(FLORE);

    await expect.poll(() => styleOf(list()?.querySelector('svg'))?.fill).toBe('none');
  });

  it('draws ticks in green', async () => {
    await shown(FLORE);

    await expect.poll(() => styleOf(list()?.querySelector('svg.yes'))?.color).toBe('rgb(24, 132, 61)');
  });

  it('draws crosses in red', async () => {
    await shown(FLORE);

    await expect.poll(() => styleOf(list()?.querySelector('svg.no'))?.color).toBe('rgb(197, 34, 31)');
  });

  it('sets each sign 7 px from its text', async () => {
    await shown(FLORE);

    await expect.poll(() => styleOf(list()?.querySelector('li'))?.columnGap).toBe('7px');
  });

  it('centres each sign on its text', async () => {
    await shown(FLORE);

    await expect.poll(() => styleOf(list()?.querySelector('li'))?.alignItems).toBe('center');
  });
});
