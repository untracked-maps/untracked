import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { PlaceSheet, SheetPlace } from '../../domain/open-place';
import PlaceSheetCard from './place-sheet.svelte';

const TOLD = [
  ['description:en', 'A place the visitors of the city never miss.'],
  ['toilets', 'yes']
] as const;

const place = (kind: string, tags: readonly (readonly [string, string])[] = TOLD): SheetPlace => ({
  id: kind,
  name: 'Opéra Garnier',
  kind,
  website: 'https://maison.example',
  tags: Object.fromEntries(tags),
  coordinates: { longitude: 2.2893, latitude: 48.8549 }
});

const shown = async (opened: SheetPlace): Promise<void> => {
  await render(PlaceSheetCard, {
    sheet: of<PlaceSheet>({ status: 'open', from: 'map', place: opened }),
    onClose: (): void => undefined,
    onCopy: (): void => undefined,
    vibrate: (): void => undefined
  });
};

const sections = (): readonly string[] =>
  [...document.querySelectorAll('section h3')].map(({ textContent }) => textContent.trim());

const localName = (): ReturnType<typeof page.getByText> => page.getByText('Local name: Palais Garnier');

describe('the sheet of a place', () => {
  it('tells about a place expected to have opening hours after the rest', async () => {
    await shown(place('cafe'));

    await expect.poll(sections).toEqual(['Good to know', 'Details', 'About']);
  });

  it('tells about a monument first', async () => {
    await shown(place('monument'));

    await expect.poll(sections).toEqual(['About', 'Good to know', 'Details']);
  });

  it('tells about a station before the rest', async () => {
    await shown(place('station'));

    await expect.poll(sections).toEqual(['About', 'Good to know', 'Details']);
  });

  it('names a place after the precise type its tags tell', async () => {
    await shown(place('attraction', [['man_made', 'tower']]));

    await expect.element(page.getByText('Tower', { exact: true })).toBeVisible();
  });

  it('tells the local name of a place under its type', async () => {
    await shown(place('theatre', [['name', 'Palais Garnier']]));

    await expect
      .poll(() => document.querySelector('hgroup')?.textContent.replaceAll(/\s+/gu, ' ').trim())
      .toBe('Opéra Garnier Theatre Local name: Palais Garnier');
  });

  it('writes the local name at 13 px', async () => {
    await shown(place('theatre', [['name', 'Palais Garnier']]));

    await expect.poll(() => getComputedStyle(localName().element()).fontSize).toBe('13px');
  });

  it('tells no local name when it is the name shown', async () => {
    await shown(place('theatre', [['name', 'Opéra Garnier']]));

    await expect.poll(() => document.querySelectorAll('hgroup p').length).toBe(1);
  });
});
