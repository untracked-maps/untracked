import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { SheetPlace } from '../../domain/open-place';
import PlaceActions from './place-actions.svelte';

const SQUARE: SheetPlace = {
  id: 'louvois',
  name: 'Square Louvois',
  coordinates: { longitude: 2.3375, latitude: 48.8679 }
};

const PHONE = '+33 1 99 00 12 34';

const WEBSITE = 'https://www.procope.example/carte?langue=fr';

const shown = async (place: SheetPlace): Promise<void> => {
  await render(PlaceActions, { place });
};

describe('calling a place', () => {
  it('is a link that dials its number without spaces', async () => {
    await shown({ ...SQUARE, phone: PHONE, website: WEBSITE });

    await expect.element(page.getByRole('link', { name: 'Call' })).toHaveAttribute('href', 'tel:+33199001234');
  });

  it('is offered for a place without a website', async () => {
    await shown({ ...SQUARE, phone: PHONE });

    await expect.element(page.getByRole('link', { name: 'Call' })).toBeVisible();
  });

  it('is not offered without a phone', async () => {
    await shown({ ...SQUARE, website: WEBSITE });

    await expect.element(page.getByRole('link', { name: 'Call' })).not.toBeInTheDocument();
  });
});

describe('the website button of a place', () => {
  it('links to its website', async () => {
    await shown({ ...SQUARE, phone: PHONE, website: WEBSITE });

    await expect
      .element(page.getByRole('link', { name: 'Website', exact: true }))
      .toHaveAttribute('href', 'https://www.procope.example/carte?langue=fr');
  });

  it('opens it in a new tab', async () => {
    await shown({ ...SQUARE, phone: PHONE, website: WEBSITE });

    await expect.element(page.getByRole('link', { name: 'Website', exact: true })).toHaveAttribute('target', '_blank');
  });

  it('opens it without giving it the app', async () => {
    await shown({ ...SQUARE, phone: PHONE, website: WEBSITE });

    await expect.element(page.getByRole('link', { name: 'Website', exact: true })).toHaveAttribute('rel', 'noopener');
  });

  it('is offered for a place without a phone', async () => {
    await shown({ ...SQUARE, website: WEBSITE });

    await expect.element(page.getByRole('link', { name: 'Website', exact: true })).toBeVisible();
  });

  it('is not offered without a website', async () => {
    await shown({ ...SQUARE, phone: PHONE });

    await expect.element(page.getByRole('link', { name: 'Website', exact: true })).not.toBeInTheDocument();
  });
});
