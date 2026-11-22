import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { Coordinates, InspectedSpot } from '../../domain/inspect-point';
import SpotCard from './spot-card.svelte';

const PALAIS_ROYAL: Coordinates = { longitude: 2.3371, latitude: 48.8635 };

const RIVOLI: InspectedSpot = { kind: 'address', spot: PALAIS_ROYAL, address: 'Rue de Rivoli, 75001 Paris' };

const sharedFrom = async (): Promise<readonly unknown[]> => {
  const shared: unknown[] = [];
  await render(SpotCard, {
    spot: of(RIVOLI),
    onClose: () => undefined,
    onShare: (spot: unknown): void => {
      shared.push(spot);
    }
  });
  return shared;
};

const boxOf = (name: string): DOMRect => page.getByRole('button', { name }).element().getBoundingClientRect();

describe('sharing a spot', () => {
  it('is offered by a button named "Share"', async () => {
    await sharedFrom();

    await expect.element(page.getByRole('button', { name: 'Share' })).toBeVisible();
  });

  it('shares the title and the position of the spot', async () => {
    const shared = await sharedFrom();

    await page.getByRole('button', { name: 'Share' }).click();

    expect(shared).toEqual([{ title: 'Rue de Rivoli', at: PALAIS_ROYAL }]);
  });

  it('stands level with the close button, on the other side', async () => {
    await sharedFrom();
    const card = page.getByRole('region', { name: 'Rue de Rivoli' }).element().getBoundingClientRect();
    const [share, close] = [boxOf('Share'), boxOf('Close the card')];

    expect([share.top, share.left - card.left]).toEqual([close.top, card.right - close.right]);
  });

  it('is not offered when the page cannot share', async () => {
    await render(SpotCard, { spot: of(RIVOLI), onClose: () => undefined });

    await expect.element(page.getByRole('button', { name: 'Share' })).not.toBeInTheDocument();
  });
});
