import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { PlaceSheet, SheetPlace } from '../../domain/open-place';
import PlaceSheetCard from './place-sheet.svelte';

const FACEBOOK = 'https://facebook.example';

const WITHOUT_BUTTONS: SheetPlace = {
  id: 'procope',
  name: 'Le Procope',
  kind: 'restaurant',
  address: {
    houseNumber: '13',
    street: 'Rue de l’Ancienne-Comédie',
    postalCode: '75006',
    addressLocality: 'Paris',
    addressCountry: 'FR'
  },
  menu: 'https://www.procope.example/menu',
  instagram: 'https://instagram.example/leprocope',
  facebook: `${FACEBOOK}/procope`,
  coordinates: { longitude: 2.3388, latitude: 48.8531 }
};

const PHONE = '+33 1 99 00 12 34';
const WEBSITE = 'https://www.procope.example/carte?langue=fr';

const PROCOPE: SheetPlace = { ...WITHOUT_BUTTONS, phone: PHONE, website: WEBSITE };

const VERT_GALANT: SheetPlace = {
  id: 'vert-galant',
  name: 'Square du Vert-Galant',
  coordinates: { longitude: 2.341, latitude: 48.857 }
};

const shown = async (place: SheetPlace): Promise<void> => {
  await render(PlaceSheetCard, {
    sheet: of<PlaceSheet>({ status: 'open', place, from: 'search' }),
    onClose: (): void => undefined,
    onCopy: (): void => undefined,
    vibrate: (): void => undefined
  });
};

const details = (): ReturnType<typeof page.getByRole> => page.getByRole('region', { name: 'Details' });

const lines = (): readonly string[] =>
  [...(details().query()?.querySelectorAll('dl > div') ?? [])].map((line) =>
    [...line.children].map(({ textContent }) => textContent.trim()).join(': ')
  );

describe('calling a place', () => {
  it('is a link that dials its number without spaces', async () => {
    await shown(PROCOPE);

    await expect.element(page.getByRole('link', { name: 'Call' })).toHaveAttribute('href', 'tel:+33199001234');
  });

  it('is not offered without a phone', async () => {
    await shown({ ...WITHOUT_BUTTONS, website: WEBSITE });

    await expect.element(page.getByRole('link', { name: 'Call' })).not.toBeInTheDocument();
  });
});

describe('the website button of a place', () => {
  it('links to its website', async () => {
    await shown(PROCOPE);

    await expect
      .element(page.getByRole('link', { name: 'Website', exact: true }))
      .toHaveAttribute('href', 'https://www.procope.example/carte?langue=fr');
  });

  it('opens it in a new tab', async () => {
    await shown(PROCOPE);

    await expect.element(page.getByRole('link', { name: 'Website', exact: true })).toHaveAttribute('target', '_blank');
  });

  it('opens it without giving it the app', async () => {
    await shown(PROCOPE);
    await expect.element(page.getByRole('link', { name: 'Website', exact: true })).toHaveAttribute('rel', 'noopener');
  });

  it('is not offered without a website', async () => {
    await shown({ ...WITHOUT_BUTTONS, phone: PHONE });

    await expect.element(page.getByRole('link', { name: 'Website', exact: true })).not.toBeInTheDocument();
  });
});

describe('the row of action buttons', () => {
  it('gives its buttons the same width', async () => {
    await shown(PROCOPE);

    await expect
      .poll(() =>
        ['Call', 'Website'].map(
          (name) => page.getByRole('link', { name, exact: true }).query()?.getBoundingClientRect().width ?? 0
        )
      )
      .toSatisfy(([call = 0, website = 0]: readonly number[]) => call > 0 && call === website);
  });

  it('is where the sheet peeks down to', async () => {
    await shown(PROCOPE);

    await expect.poll(() => document.querySelector('[data-sheet-actions]')?.textContent).toContain('Call');
  });

  it('is left out for a place without phone nor website', async () => {
    await shown(WITHOUT_BUTTONS);

    await expect.poll(() => document.querySelector('[data-sheet-actions]')?.textContent).toContain('Copy the address');
  });
});

describe('the details of a place that can be reached', () => {
  it('give its phone, website, menu, Instagram, Facebook and address, in that order', async () => {
    await shown(PROCOPE);

    await expect
      .poll(lines)
      .toEqual([
        'Phone: +33 1 99 00 12 34',
        'Website: procope.example',
        'Menu: See the menu',
        'Instagram: @leprocope',
        'Facebook: procope',
        'Address: 13 Rue de l’Ancienne-Comédie, 75006 Paris'
      ]);
  });

  it('give only what is known', async () => {
    await shown({ ...VERT_GALANT, phone: '+33 1 99 00 56 78' });

    await expect.poll(lines).toEqual(['Phone: +33 1 99 00 56 78']);
  });

  it('link the phone to a call', async () => {
    await shown(PROCOPE);

    await expect
      .element(details().getByRole('link', { name: '+33 1 99 00 12 34' }))
      .toHaveAttribute('href', 'tel:+33199001234');
  });

  it('link the website', async () => {
    await shown(PROCOPE);

    await expect
      .element(details().getByRole('link', { name: 'procope.example' }))
      .toHaveAttribute('href', 'https://www.procope.example/carte?langue=fr');
  });

  it('link the menu', async () => {
    await shown(PROCOPE);

    await expect
      .element(details().getByRole('link', { name: 'See the menu' }))
      .toHaveAttribute('href', 'https://www.procope.example/menu');
  });

  it('link the Instagram account', async () => {
    await shown(PROCOPE);

    await expect
      .element(details().getByRole('link', { name: '@leprocope' }))
      .toHaveAttribute('href', 'https://instagram.example/leprocope');
  });

  it('link the Facebook page', async () => {
    await shown(PROCOPE);

    await expect.element(details().getByRole('link', { name: 'procope' })).toHaveAttribute('href', `${FACEBOOK}/procope`);
  });

  it('open the pages of the place in new tabs', async () => {
    await shown(PROCOPE);

    await expect.element(details().getByRole('link', { name: 'See the menu' })).toHaveAttribute('target', '_blank');
  });

  it('never link to a script', async () => {
    await shown({ ...VERT_GALANT, menu: 'javascript:alert(1)' });

    await expect.element(details().getByRole('link', { name: 'See the menu' })).toHaveAttribute('href', '#');
  });

  it('give each link a touch area of 24 px at least', async () => {
    await shown(PROCOPE);

    await expect
      .poll(() => details().getByRole('link', { name: 'procope' }).query()?.getBoundingClientRect().height)
      .toBeGreaterThanOrEqual(24);
  });
});
