import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { Basemap } from '../../domain/choose-basemap';
import BasemapSwitcher from './basemap-switcher.svelte';
import SatelliteCredit from './satellite-credit.svelte';

const chosen: Basemap[] = [];

const keepChosen = (basemap: Basemap): void => {
  chosen.push(basemap);
};

describe('basemap switcher', () => {
  it('groups the basemaps under the map type', async () => {
    await render(BasemapSwitcher, { basemap: of<Basemap>('plan'), onChoose: keepChosen });

    await expect.element(page.getByRole('group', { name: 'Map type' })).toBeVisible();
  });

  it('checks the chosen basemap', async () => {
    await render(BasemapSwitcher, { basemap: of<Basemap>('satellite'), onChoose: keepChosen });

    await expect.element(page.getByRole('radio', { name: 'Satellite' })).toBeChecked();
  });

  it('leaves the plan unchecked once the satellite view is chosen', async () => {
    await render(BasemapSwitcher, { basemap: of<Basemap>('satellite'), onChoose: keepChosen });

    await expect.element(page.getByRole('radio', { name: 'Plan' })).not.toBeChecked();
  });

  it('draws a thumbnail of each basemap', async () => {
    const { container } = await render(BasemapSwitcher, { basemap: of<Basemap>('plan'), onChoose: keepChosen });

    expect(container.querySelector('.thumbnail.satellite')).not.toBeNull();
  });

  it('tells which basemap the visitor chooses', async () => {
    await render(BasemapSwitcher, { basemap: of<Basemap>('plan'), onChoose: keepChosen });

    await page.getByRole('radio', { name: 'Satellite' }).click();

    expect(chosen.at(-1)).toBe('satellite');
  });
});

describe('satellite credit', () => {
  it('credits IGN for the satellite photos', async () => {
    await render(SatelliteCredit, { basemap: of<Basemap>('satellite') });

    await expect
      .element(page.getByRole('link', { name: '© IGN BD ORTHO®' }))
      .toHaveAttribute('href', 'https://geoservices.ign.fr/bdortho');
  });

  it('credits nobody more on the plan', async () => {
    await render(SatelliteCredit, { basemap: of<Basemap>('plan') });

    await expect.element(page.getByRole('link')).not.toBeInTheDocument();
  });
});
