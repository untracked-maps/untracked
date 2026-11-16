import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import SegmentedLinks from './segmented-links.svelte';

const links = [
  { href: '/', text: 'English', current: true, lang: 'en' },
  { href: '/fr', text: 'Français', current: false, lang: 'fr' }
];

describe('segmented links', () => {
  it('names its navigation', async () => {
    await render(SegmentedLinks, { label: 'Language', links });

    await expect.element(page.getByRole('navigation', { name: 'Language' })).toBeVisible();
  });

  it('shows the name of its navigation', async () => {
    await render(SegmentedLinks, { label: 'Language', links });

    await expect.element(page.getByText('Language')).toBeVisible();
  });

  it('leads each link to its address', async () => {
    await render(SegmentedLinks, { label: 'Language', links });

    await expect.element(page.getByRole('link', { name: 'Français' })).toHaveAttribute('href', '/fr');
  });

  it('marks the current link as the current page', async () => {
    await render(SegmentedLinks, { label: 'Language', links });

    await expect.element(page.getByRole('link', { name: 'English' })).toHaveAttribute('aria-current', 'page');
  });

  it('leaves the other links unmarked', async () => {
    await render(SegmentedLinks, { label: 'Language', links });

    await expect.element(page.getByRole('link', { name: 'Français' })).not.toHaveAttribute('aria-current');
  });

  it('tells the language of the page each link leads to', async () => {
    await render(SegmentedLinks, { label: 'Language', links });

    await expect.element(page.getByRole('link', { name: 'Français' })).toHaveAttribute('hreflang', 'fr');
  });

  it('writes each link in its own language', async () => {
    await render(SegmentedLinks, { label: 'Language', links });

    await expect.element(page.getByRole('link', { name: 'Français' })).toHaveAttribute('lang', 'fr');
  });

  it('lets the router follow the links by default', async () => {
    await render(SegmentedLinks, { label: 'Language', links });

    await expect.element(page.getByRole('link', { name: 'Français' })).toHaveAttribute('data-sveltekit-reload', 'off');
  });

  it('reloads the whole page when asked', async () => {
    await render(SegmentedLinks, { label: 'Language', links, reload: true });

    await expect.element(page.getByRole('link', { name: 'Français' })).toHaveAttribute('data-sveltekit-reload', '');
  });
});
