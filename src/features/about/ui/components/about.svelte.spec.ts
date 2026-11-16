import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import About from './about.svelte';

const languages = createRawSnippet(() => ({ render: (): string => '<nav aria-label="Language"></nav>' }));

const EVERY_SOURCE =
  /\(ODbL\) · OpenFreeMap · © OpenMapTiles · Orthophotos © IGN – BD ORTHO®, Géoplateforme · Transit lines © Île-de-France Mobilités \(Licence Ouverte 2[.]0\) · Bike lanes from OpenStreetMap \(January 2024\), served by IGN/u;

const props = { privacyHref: '/privacy', languages };

describe('about', () => {
  it('says what Untracked Maps keeps about the visitor', async () => {
    await render(About, props);

    await expect.element(page.getByText('Untracked Maps keeps nothing about you')).toBeVisible();
  });

  it('leads to the page that says who sees what', async () => {
    await render(About, props);

    await expect
      .element(page.getByRole('link', { name: 'Who sees what 0 trackers, 0 cookies: check for yourself' }))
      .toHaveAttribute('href', '/privacy');
  });
});

describe('about sources and help', () => {
  it('names OpenStreetMap as the source of the map', async () => {
    await render(About, props);

    await expect
      .element(page.getByRole('link', { name: 'OpenStreetMap The free map, made by volunteers' }))
      .toHaveAttribute('href', 'https://www.openstreetmap.org');
  });

  it('names OpenFreeMap as the source of the basemap', async () => {
    await render(About, props);

    await expect
      .element(page.getByRole('link', { name: 'OpenFreeMap The basemap' }))
      .toHaveAttribute('href', 'https://openfreemap.org');
  });

  it('names IGN as the source of the satellite photos and the bike lanes', async () => {
    await render(About, props);

    await expect
      .element(page.getByRole('link', { name: 'IGN Géoplateforme Satellite photos and bike lanes, when you show them' }))
      .toHaveAttribute('href', 'https://geoservices.ign.fr');
  });

  it('names Île-de-France Mobilités as the source of the transit lines', async () => {
    await render(About, props);

    await expect
      .element(page.getByRole('link', { name: 'Île-de-France Mobilités Transit lines of Île-de-France, when you show them' }))
      .toHaveAttribute('href', 'https://data.iledefrance-mobilites.fr');
  });

  it('leads to the page of OpenStreetMap that explains how to report a mistake', async () => {
    await render(About, props);

    await expect
      .element(page.getByRole('link', { name: 'Report a mistake on the map' }))
      .toHaveAttribute('href', 'https://www.openstreetmap.org/fixthemap');
  });

  it('leads to the source code', async () => {
    await render(About, props);

    await expect
      .element(page.getByRole('link', { name: 'Open source code' }))
      .toHaveAttribute('href', 'https://github.com/untracked-maps/untracked');
  });
});

describe('about languages and credits', () => {
  it('holds the language links it is given', async () => {
    await render(About, props);

    await expect.element(page.getByRole('navigation', { name: 'Language' })).toBeInTheDocument();
  });

  it('credits the contributors of OpenStreetMap, with a link to its licence', async () => {
    await render(About, props);

    await expect
      .element(page.getByRole('link', { name: '© OpenStreetMap contributors' }))
      .toHaveAttribute('href', 'https://www.openstreetmap.org/copyright');
  });

  it('credits every source of the map', async () => {
    await render(About, props);

    await expect.element(page.getByText(EVERY_SOURCE)).toBeVisible();
  });

  it('heads its sections', async () => {
    await render(About, props);

    await expect.element(page.getByRole('heading', { level: 3, name: 'Your privacy' })).toBeVisible();
  });

  it('heads the sources of the map', async () => {
    await render(About, props);

    await expect.element(page.getByRole('heading', { level: 3, name: 'Where the information comes from' })).toBeVisible();
  });

  it('heads the ways to help', async () => {
    await render(About, props);

    await expect.element(page.getByRole('heading', { level: 3, name: 'Help' })).toBeVisible();
  });

  it('says the map needs no account and shows no advertising', async () => {
    await render(About, props);

    await expect.element(page.getByText('No account, no advertising')).toBeVisible();
  });
});
