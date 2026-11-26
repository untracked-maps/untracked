import { of } from 'rxjs';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { Glance } from '../../domain/glance-at-place';
import PlaceGlance from './place-glance.svelte';

const hours = createRawSnippet(() => ({ render: (): string => '<div><dt>Opening hours</dt><dd>Open</dd></div>' }));

const EVERYTHING: Glance = {
  columns: [
    { kind: 'hours' },
    { kind: 'distance', metres: 354 },
    { kind: 'wheelchair', access: 'limited' },
    { kind: 'entrance', fee: 'free' }
  ]
};

const shown = async (glance: Glance): Promise<void> => {
  await render(PlaceGlance, { glance: of(glance), hours, locale: 'en' });
};

const columns = (): readonly string[] =>
  [...(document.querySelector('dl')?.children ?? [])].map((column) =>
    [...column.children].map((part) => part.textContent).join(': ')
  );

const widthsOf = (): readonly number[] =>
  [...(document.querySelector('dl')?.children ?? [])].map((column) => Math.round(column.getBoundingClientRect().width));

describe('the strip of a place', () => {
  it('shows each column, its name above its value, in order', async () => {
    await shown(EVERYTHING);

    expect(columns()).toEqual(['Opening hours: Open', 'Distance: 350 m', 'Wheelchair: Partial', 'Entrance: Free']);
  });

  it('is named for screen readers', async () => {
    await shown(EVERYTHING);

    await expect.element(page.getByLabelText('At a glance')).toBeVisible();
  });

  it('gives each column the same width', async () => {
    await shown(EVERYTHING);

    expect(new Set(widthsOf()).size).toBe(1);
  });

  it('is absent when nothing is known', async () => {
    await shown({ columns: [] });

    expect(document.querySelector('dl')).toBeNull();
  });

  it('draws a rule between two columns', async () => {
    await shown(EVERYTHING);

    expect(getComputedStyle(document.querySelectorAll('dl > div')[1] ?? document.body).borderInlineStartWidth).toBe('1px');
  });

  it('draws no rule before the first column', async () => {
    await shown(EVERYTHING);

    expect(getComputedStyle(document.querySelector('dl > div') ?? document.body).borderInlineStartWidth).toBe('0px');
  });

  it('writes a value larger than its name', async () => {
    await shown({ columns: [{ kind: 'entrance', fee: 'paid' }] });

    expect(getComputedStyle(document.querySelector('dd') ?? document.body).fontSize).toBe('16px');
  });
});
