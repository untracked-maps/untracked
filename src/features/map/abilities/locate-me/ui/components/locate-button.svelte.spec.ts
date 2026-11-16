import { NEVER, of, Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { locateMe } from '../../domain/locate-me';
import { inMemoryLocate } from '../../implementation/in-memory/in-memory-locate';
import LocateButton from './locate-button.svelte';

const NOTRE_DAME = { kind: 'located', position: { longitude: 2.3499, latitude: 48.853 } } as const;

describe('locate button', () => {
  it('offers to show the position of the visitor', async () => {
    await render(LocateButton, { status: NEVER, onLocate: () => undefined });

    await expect.element(page.getByRole('button', { name: 'Show my position' })).toBeVisible();
  });

  it('can be pressed once ready', async () => {
    await render(LocateButton, { status: NEVER, onLocate: () => undefined });

    await expect.element(page.getByRole('button', { name: 'Show my position' })).toBeEnabled();
  });

  it('cannot be pressed until the app is ready', async () => {
    await render(LocateButton, { status: NEVER, onLocate: () => undefined, ready: false });

    await expect.element(page.getByRole('button', { name: 'Show my position' })).toBeDisabled();
  });

  it('says nothing before the visitor asks', async () => {
    await render(LocateButton, { status: NEVER, onLocate: () => undefined });

    await expect.element(page.getByRole('status')).toBeEmptyDOMElement();
  });

  it('tells the visitor the map is centred on them once pressed', async () => {
    const requests = new Subject<void>();
    const status = locateMe({ locate: inMemoryLocate(NOTRE_DAME) })(requests);
    await render(LocateButton, { status, onLocate: () => requests.next() });

    await page.getByRole('button', { name: 'Show my position' }).click();

    await expect.element(page.getByRole('status')).toHaveTextContent('The map is centred on your position.');
  });

  it('tells the visitor their position is on its way', async () => {
    await render(LocateButton, { status: of({ kind: 'locating' } as const), onLocate: () => undefined });

    await expect.element(page.getByRole('status')).toHaveTextContent('Looking for your position…');
  });

  it('tells the visitor how to allow the site to see their position', async () => {
    await render(LocateButton, { status: of({ kind: 'permission-denied' } as const), onLocate: () => undefined });

    await expect
      .element(page.getByRole('status'))
      .toHaveTextContent(
        'You have not allowed this site to see your position. Allow it in your browser’s settings, then try again.'
      );
  });

  it('tells the visitor when their position cannot be found', async () => {
    await render(LocateButton, { status: of({ kind: 'position-unavailable' } as const), onLocate: () => undefined });

    await expect
      .element(page.getByRole('status'))
      .toHaveTextContent('Your position cannot be found right now. Try again in a moment.');
  });
});
