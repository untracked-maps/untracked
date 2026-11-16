import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import WhoSeesWhat from './who-sees-what.svelte';

describe('who sees what', () => {
  it('is titled after the question it answers', async () => {
    await render(WhoSeesWhat);

    await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Who sees what');
  });

  it('names the provider of the basemap', async () => {
    await render(WhoSeesWhat);

    await expect.element(page.getByRole('heading', { level: 2, name: 'OpenFreeMap' })).toBeVisible();
  });

  it('says what the provider of the basemap sees', async () => {
    await render(WhoSeesWhat);

    await expect
      .element(
        page.getByRole('region', { name: 'OpenFreeMap' }).getByText('Your IP address and the area of the map you look at.')
      )
      .toBeVisible();
  });

  it('says what the app keeps about the visitor', async () => {
    await render(WhoSeesWhat);

    await expect.element(page.getByText('Untracked Maps keeps nothing about you.', { exact: false })).toBeVisible();
  });

  it('heads what a service sees', async () => {
    await render(WhoSeesWhat);

    await expect
      .element(page.getByRole('region', { name: 'OpenFreeMap' }).getByRole('term').filter({ hasText: 'What it sees' }))
      .toBeVisible();
  });

  it('heads why the app calls a service', async () => {
    await render(WhoSeesWhat);

    await expect
      .element(page.getByRole('region', { name: 'OpenFreeMap' }).getByRole('term').filter({ hasText: 'Why' }))
      .toBeVisible();
  });

  it('says why the app calls the provider of the basemap', async () => {
    await render(WhoSeesWhat);

    await expect.element(page.getByText('To draw the basemap.')).toBeVisible();
  });
});

describe('who sees what, among the services the visitor turns on', () => {
  it('names the provider of the satellite photos and the bike lanes', async () => {
    await render(WhoSeesWhat);

    await expect.element(page.getByRole('heading', { level: 2, name: 'IGN Géoplateforme' })).toBeVisible();
  });

  it('says that IGN is asked for nothing until the visitor chooses what it draws', async () => {
    await render(WhoSeesWhat);

    await expect
      .element(page.getByText('Only once you choose the satellite view or show the bike lanes', { exact: false }))
      .toBeVisible();
  });

  it('says that IGN publishes nothing about its access logs', async () => {
    await render(WhoSeesWhat);

    await expect.element(page.getByText('IGN publishes no statement on how long it keeps access logs.')).toBeVisible();
  });

  it('heads when the app calls a service', async () => {
    await render(WhoSeesWhat);

    await expect
      .element(page.getByRole('region', { name: 'IGN Géoplateforme' }).getByRole('term').filter({ hasText: 'When' }))
      .toBeVisible();
  });

  it('heads what a service says about its access logs', async () => {
    await render(WhoSeesWhat);

    await expect
      .element(page.getByRole('region', { name: 'IGN Géoplateforme' }).getByRole('term').filter({ hasText: 'Access logs' }))
      .toBeVisible();
  });

  it('names the provider of the transit lines', async () => {
    await render(WhoSeesWhat);

    await expect.element(page.getByRole('heading', { level: 2, name: 'Île-de-France Mobilités' })).toBeVisible();
  });

  it('says that Île-de-France Mobilités does not see the area the visitor looks at', async () => {
    await render(WhoSeesWhat);

    await expect.element(page.getByText('so it does not tell the area you look at', { exact: false })).toBeVisible();
  });

  it('says that Île-de-France Mobilités is asked for nothing until the visitor shows the transit lines', async () => {
    await render(WhoSeesWhat);

    await expect.element(page.getByText('Only once you show the transit lines', { exact: false })).toBeVisible();
  });

  it('says that Île-de-France Mobilités publishes nothing about its access logs', async () => {
    await render(WhoSeesWhat);

    await expect.element(page.getByText('run by Opendatasoft, keeps access logs', { exact: false })).toBeVisible();
  });
});
