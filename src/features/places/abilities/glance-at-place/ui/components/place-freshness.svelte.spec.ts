import { of, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { Glance } from '../../domain/glance-at-place';
import PlaceFreshness from './place-freshness.svelte';

const VERIFIED: Glance = { columns: [], freshness: { state: 'verified', checked: { year: 2026, month: 3 } } };

const OLD: Glance = { columns: [], freshness: { state: 'not verified', checked: { year: 2023, month: 6 } } };

const shown = async (glance: Glance): Promise<HTMLElement> =>
  (await render(PlaceFreshness, { glance: of(glance), locale: 'en' })).container;

const lineOf = (container: HTMLElement): Element | null => container.querySelector('div');

describe('the freshness line of a place', () => {
  it('tells when the information was verified', async () => {
    await shown(VERIFIED);

    await expect.element(page.getByText('Info verified in Mar 2026')).toBeVisible();
  });

  it('draws a check before verified information', async () => {
    expect(
      lineOf(await shown(VERIFIED))
        ?.querySelector('path')
        ?.getAttribute('d')
    ).toBe('m5 12.5 4.5 4.5L19 7.5');
  });

  it('writes verified information in green', async () => {
    expect(getComputedStyle(lineOf(await shown(VERIFIED)) ?? document.body).color).toBe('rgb(24, 132, 61)');
  });

  it('tells since when old information has not been verified', async () => {
    await shown(OLD);

    await expect.element(page.getByText('Info not verified since 2023')).toBeVisible();
  });

  it('draws no check before old information', async () => {
    expect(lineOf(await shown(OLD))?.querySelector(':scope > svg')).toBeNull();
  });

  it('writes old information in grey', async () => {
    expect(getComputedStyle(lineOf(await shown(OLD)) ?? document.body).color).toBe('rgb(103, 107, 114)');
  });

  it('is absent when the place was never checked', async () => {
    expect(lineOf(await shown({ columns: [] }))).toBeNull();
  });

  it('explains what verified means', async () => {
    await shown(VERIFIED);
    await page.getByRole('button', { name: 'What does “verified” mean?' }).click();

    await expect
      .element(
        page.getByText(
          'A contributor to OpenStreetMap, the free map we use, confirmed the information of this place on that date (hours, address, phone…), most often by going there.'
        )
      )
      .toBeVisible();
  });

  it('says verified is no judgement of the place', async () => {
    await shown(VERIFIED);
    await page.getByRole('button', { name: 'What does “verified” mean?' }).click();

    await expect.element(page.getByText('It tells how fresh the information is, not how good the place is.')).toBeVisible();
  });
});

describe('the explanation of the freshness of a place', () => {
  it('is titled', async () => {
    await shown(VERIFIED);
    await page.getByRole('button', { name: 'What does “verified” mean?' }).click();

    await expect.element(page.getByRole('heading', { name: 'Verified info' })).toBeVisible();
  });

  it('can be closed', async () => {
    await shown(VERIFIED);
    await page.getByRole('button', { name: 'What does “verified” mean?' }).click();

    await expect.element(page.getByRole('button', { name: 'Close' })).toBeVisible();
  });

  it('closes when the app asks it to', async () => {
    const closings = new Subject<void>();
    await render(PlaceFreshness, {
      glance: of(VERIFIED),
      locale: 'en',
      closable: { onToggle: (): void => undefined, closings }
    });
    await page.getByRole('button', { name: 'What does “verified” mean?' }).click();
    await vi.waitFor(() => page.getByRole('heading', { name: 'Verified info' }).element());
    closings.next();

    await expect.poll(() => document.querySelector('dialog')?.open).toBe(false);
  });
});
