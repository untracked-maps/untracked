import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { PlaceSheet, SheetPlace } from '../../domain/open-place';
import PlaceSheetCard from './place-sheet.svelte';

const FLORE: SheetPlace = {
  id: 'flore',
  name: 'Café de Flore',
  kind: 'cafe',
  address: {
    houseNumber: '172',
    street: 'Boulevard Saint-Germain',
    postalCode: '75006',
    addressLocality: 'Paris',
    addressCountry: 'FR'
  },
  coordinates: { longitude: 2.332_63, latitude: 48.854_04 }
};

const STATUE: SheetPlace = { id: 'statue', name: 'Statue', coordinates: { longitude: 2.34, latitude: 48.857 } };

const ADDRESS = '172 Boulevard Saint-Germain, 75006 Paris';

const copiesOf = async (place: SheetPlace): Promise<readonly string[]> => {
  const copies: string[] = [];
  const sheet: PlaceSheet = { status: 'open', place, from: 'kind list' };
  await render(PlaceSheetCard, {
    sheet: of(sheet),
    onClose: (): void => undefined,
    onCopy: (text: string): void => {
      copies.push(text);
    },
    vibrate: (milliseconds: number): void => {
      copies.push(`vibrated ${milliseconds} ms`);
    }
  });
  return copies;
};

const pointer = (type: string, x: number, y: number): PointerEvent =>
  new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true });

const pause = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const pressedFor = async (milliseconds: number, after: PointerEvent = pointer('pointerover', 10, 10)): Promise<void> => {
  await vi.waitFor(() => page.getByText(ADDRESS).element());
  const address = page.getByText(ADDRESS).element();
  address.dispatchEvent(pointer('pointerdown', 10, 10));
  address.dispatchEvent(after);
  await pause(milliseconds);
};

describe('copying the address of a place', () => {
  it('copies the address shown', async () => {
    const copies = await copiesOf(FLORE);

    await page.getByRole('button', { name: 'Copy the address' }).click();

    expect(copies).toEqual([ADDRESS]);
  });

  it('is not offered for a place without an address', async () => {
    await copiesOf(STATUE);

    await expect.element(page.getByRole('button', { name: 'Copy the address' })).not.toBeInTheDocument();
  });
});

describe('a long press on the address', () => {
  it('copies it', async () => {
    const copies = await copiesOf(FLORE);

    await pressedFor(600);

    expect(copies).toContain(ADDRESS);
  });

  it('vibrates 10 ms first, where the device allows it', async () => {
    const copies = await copiesOf(FLORE);

    await pressedFor(600);

    expect(copies).toEqual(['vibrated 10 ms', ADDRESS]);
  });

  it('lasts 480 ms', async () => {
    const copies = await copiesOf(FLORE);

    await pressedFor(400);

    expect(copies).toEqual([]);
  });

  it('copies nothing when the finger lifts before', async () => {
    const copies = await copiesOf(FLORE);

    await pressedFor(600, pointer('pointerup', 10, 10));

    expect(copies).toEqual([]);
  });

  it('copies nothing when the finger moves more than 10 px', async () => {
    const copies = await copiesOf(FLORE);

    await pressedFor(600, pointer('pointermove', 10, 21));

    expect(copies).toEqual([]);
  });

  it('still copies when the finger moves 10 px', async () => {
    const copies = await copiesOf(FLORE);

    await pressedFor(600, pointer('pointermove', 16, 18));

    expect(copies).toContain(ADDRESS);
  });

  it('copies nothing when the press is cancelled', async () => {
    const copies = await copiesOf(FLORE);

    await pressedFor(600, pointer('pointercancel', 10, 10));

    expect(copies).toEqual([]);
  });
});
