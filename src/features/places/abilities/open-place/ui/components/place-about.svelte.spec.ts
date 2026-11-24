import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { SheetPlace } from '../../domain/open-place';
import PlaceAbout from './place-about.svelte';

const SHORT = 'An iron tower raised for a fair.';

const LONG =
  'This tower of iron was raised for a fair and was to stand for twenty years only. It still stands above the river, and millions of visitors climb it every year to see all the roofs of the city. '.repeat(
    3
  );

const told = (id: string, description?: string): SheetPlace => ({
  id,
  name: 'Tour de fer',
  ...(description === undefined ? {} : { tags: Object.fromEntries([['description:en', description]]) }),
  coordinates: { longitude: 2.2945, latitude: 48.8583 }
});

const shown = async (place: SheetPlace): Promise<Awaited<ReturnType<typeof render>>> =>
  await render(PlaceAbout, { place, locale: 'en' });

const about = (): ReturnType<typeof page.getByRole> => page.getByRole('region', { name: 'About' });

const more = (): ReturnType<typeof page.getByRole> => page.getByRole('button', { name: 'More' });

const text = (): Element | null | undefined => about().query()?.querySelector('p');

const styleOf = (element: Element | null | undefined): CSSStyleDeclaration | undefined =>
  element === null || element === undefined ? undefined : getComputedStyle(element);

const linesOf = (element: Element | null | undefined): number =>
  Math.round((element?.getBoundingClientRect().height ?? 0) / Number.parseFloat(styleOf(element)?.lineHeight ?? '1'));

describe('the text about a place', () => {
  it('is left out when the place has none', async () => {
    await shown(told('bare'));

    await expect.element(about()).not.toBeInTheDocument();
  });

  it('is told under its heading', async () => {
    await shown(told('short', SHORT));

    await expect.poll(() => text()?.textContent).toBe(SHORT);
  });

  it('is left out when it is not written in the language of the visitor', async () => {
    await render(PlaceAbout, { place: told('short', SHORT), locale: 'fr' });

    await expect.element(about()).not.toBeInTheDocument();
  });

  it('stands 22 px under what precedes it', async () => {
    await shown(told('short', SHORT));

    await expect.poll(() => styleOf(about().query())?.marginBlockStart).toBe('22px');
  });

  it('is written at 14.5 px', async () => {
    await shown(told('short', SHORT));

    await expect.poll(() => styleOf(text())?.fontSize).toBe('14.5px');
  });
});

describe('a long text about a place', () => {
  it('is not the short one, which offers no more', async () => {
    await shown(told('short', SHORT));

    await expect.element(more()).not.toBeInTheDocument();
  });

  it('offers more of a long text', async () => {
    await shown(told('long', LONG));

    await expect.element(more()).toBeVisible();
  });

  it('cuts a long text at 4 lines', async () => {
    await shown(told('long', LONG));

    await expect.poll(() => linesOf(text())).toBe(4);
  });

  it('shows a long text whole once more is asked', async () => {
    await shown(told('long', LONG));
    await more().click();

    await expect.poll(() => linesOf(text())).toBeGreaterThan(4);
  });

  it('offers no less once the text shows whole', async () => {
    await shown(told('long', LONG));
    await more().click();

    await expect.poll(() => about().query()?.querySelectorAll('button').length).toBe(0);
  });

  it('keeps the focus on the text once more is asked', async () => {
    await shown(told('long', LONG));
    await more().click();

    await expect.poll(() => document.activeElement).toBe(text());
  });

  it('cuts the long text of the next place again', async () => {
    const { rerender } = await shown(told('long', LONG));
    await more().click();
    await rerender({ place: told('next', LONG), locale: 'en' });

    await expect.element(more()).toBeVisible();
  });
});
