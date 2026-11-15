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

    await expect.element(page.getByText('Your IP address and the area of the map you look at.')).toBeVisible();
  });

  it('says what the app keeps about the visitor', async () => {
    await render(WhoSeesWhat);

    await expect.element(page.getByText('Untracked Maps keeps nothing about you.', { exact: false })).toBeVisible();
  });

  it('heads what a service sees', async () => {
    await render(WhoSeesWhat);

    await expect.element(page.getByRole('term').filter({ hasText: 'What it sees' })).toBeVisible();
  });

  it('heads why the app calls a service', async () => {
    await render(WhoSeesWhat);

    await expect.element(page.getByRole('term').filter({ hasText: 'Why' })).toBeVisible();
  });

  it('says why the app calls the provider of the basemap', async () => {
    await render(WhoSeesWhat);

    await expect.element(page.getByText('To draw the basemap.')).toBeVisible();
  });
});
