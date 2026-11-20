import { BehaviorSubject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { InspectedSpot } from '../../domain/inspect-point';
import SpotCard from './spot-card.svelte';

const RIVOLI: InspectedSpot = {
  kind: 'address',
  spot: { longitude: 2.337_64, latitude: 48.860_61 },
  address: 'Rue de Rivoli, 75001 Paris'
};

const RENNES: InspectedSpot = {
  kind: 'address',
  spot: { longitude: 2.329, latitude: 48.851 },
  address: '57 Rue de Rennes, 75006 Paris'
};

const sheet = (): HTMLElement | null => document.querySelector<HTMLElement>('.sheet');

const scroller = (): Element => document.querySelector('.scroller') ?? document.body;

const report = (): Element => page.getByRole('link', { name: 'Report', exact: true }).element();

const fingerAt = (type: string, heights: readonly number[]): boolean =>
  scroller().dispatchEvent(
    new TouchEvent(type, {
      bubbles: true,
      touches: heights.map((clientY) => new Touch({ identifier: 0, target: scroller(), clientX: 100, clientY }))
    })
  );

const swipeDown = (by: number): boolean =>
  fingerAt('touchstart', [700]) && fingerAt('touchmove', [700 + by]) && fingerAt('touchend', []);

const peeks = (): boolean =>
  (sheet()?.getBoundingClientRect().height ?? 0) ===
  report().getBoundingClientRect().top - (sheet()?.getBoundingClientRect().top ?? 0) - 6;

const whole = (): boolean => sheet()?.getBoundingClientRect().height === scroller().scrollHeight;

const peeked = (): Promise<void> => expect.poll(peeks).toBe(true);

type Seen = {
  readonly events: (string | number)[];
  readonly spot: BehaviorSubject<InspectedSpot>;
};

const onPhone = async (): Promise<Seen> => {
  const events: (string | number)[] = [];
  const spot = new BehaviorSubject<InspectedSpot>(RIVOLI);
  await page.viewport(390, 844);
  await render(SpotCard, {
    spot,
    onClose: (): void => {
      events.push('closed');
    },
    onSheetHeight: (height: number): void => {
      events.push(height);
    }
  });
  await expect.poll(whole).toBe(true);
  return { events, spot };
};

describe('spot card on a phone', () => {
  it('is a sheet fixed along the bottom of the screen', async () => {
    await onPhone();

    await expect.element(sheet()).toHaveStyle({ position: 'fixed' });
  });

  it('opens with all it has to say', async () => {
    await onPhone();

    expect(whole()).toBe(true);
  });

  it('peeks down to just above its actions once flicked down', async () => {
    await onPhone();
    swipeDown(20);

    await expect.poll(peeks).toBe(true);
  });

  it('opens whole again for another spot', async () => {
    const { spot } = await onPhone();
    swipeDown(20);
    spot.next(RENNES);

    await expect.poll(whole).toBe(true);
  });

  it('closes once swiped down from its peek', async () => {
    const { events } = await onPhone();
    swipeDown(20);
    await peeked();
    swipeDown(20);

    await expect.poll(() => events.at(-1)).toBe('closed');
  });

  it('can be enlarged with the grip', async () => {
    await onPhone();
    swipeDown(20);

    await expect.element(page.getByRole('button', { name: 'Enlarge the sheet' })).toBeVisible();
  });

  it('can be reduced once it fills a small screen', async () => {
    await onPhone();
    await page.viewport(390, 400);
    await page.getByRole('button', { name: 'Enlarge the sheet' }).click();

    await expect.element(page.getByRole('button', { name: 'Reduce the sheet' })).toBeVisible();
  });

  it('tells the height of its sheet', async () => {
    const { events } = await onPhone();

    expect(events.at(-1)).toBe(scroller().scrollHeight);
  });

  it('is not drawn as a card inside the sheet', async () => {
    await onPhone();

    await expect
      .element(page.getByRole('region').element().querySelector<HTMLElement>('.floating'))
      .toHaveStyle({ boxShadow: 'none', paddingTop: '0px' });
  });

  it('takes the whole width of the screen', async () => {
    await onPhone();

    await expect.element(page.getByRole('region')).toHaveStyle({ inlineSize: '390px' });
  });
});
