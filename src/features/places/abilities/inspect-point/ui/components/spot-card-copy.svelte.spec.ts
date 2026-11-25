import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { InspectedSpot } from '../../domain/inspect-point';
import SpotCard from './spot-card.svelte';

const RENNES: InspectedSpot = {
  kind: 'address',
  spot: { longitude: 2.327_42, latitude: 48.847_81 },
  address: { houseNumber: '57', street: 'Rue de Rennes', postalCode: '75006', addressLocality: 'Paris', addressCountry: 'FR' }
};

const pointer = (type: string): PointerEvent =>
  new PointerEvent(type, { bubbles: true, clientX: 10, clientY: 10, pointerId: 1, isPrimary: true });

const pause = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const copiesAfterPressing = async (spot: InspectedSpot, text: string): Promise<readonly string[]> => {
  const copies: string[] = [];
  await render(SpotCard, {
    spot: of(spot),
    onClose: (): void => undefined,
    onCopy: (copied: string): void => {
      copies.push(copied);
    },
    vibrate: (milliseconds: number): void => {
      copies.push(`vibrated ${milliseconds} ms`);
    }
  });
  await vi.waitFor(() => page.getByText(text, { exact: true }).element());
  page.getByText(text, { exact: true }).element().dispatchEvent(pointer('pointerdown'));
  await pause(600);
  return copies;
};

describe('a long press on the address of a spot', () => {
  it('copies the whole address', async () => {
    expect(await copiesAfterPressing(RENNES, '57 Rue de Rennes')).toContain('57 Rue de Rennes, 75006 Paris');
  });

  it('copies it from the line under the street too', async () => {
    expect(await copiesAfterPressing(RENNES, '75006 Paris')).toContain('57 Rue de Rennes, 75006 Paris');
  });

  it('vibrates first, where the device allows it', async () => {
    expect(await copiesAfterPressing(RENNES, '57 Rue de Rennes')).toEqual(['vibrated 10 ms', '57 Rue de Rennes, 75006 Paris']);
  });

  it('copies nothing on a spot without an address', async () => {
    expect(await copiesAfterPressing({ kind: 'no-address', spot: RENNES.spot }, 'Selected spot')).toEqual([]);
  });
});
