import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import StreetView from './street-view.svelte';

const PANORAMA = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="1000"/>')}`;

const RODIN = { status: 'shown', name: 'Musée Rodin', image: 'street-views/sight-01.svg', facing: 0.5 } as const;

const viewer = (): Element => page.getByRole('dialog').element();

const fingerAt =
  (target: EventTarget) =>
  (clientY: number): Touch =>
    new Touch({ identifier: 0, target, clientX: 200, clientY });

const touchedAt = (type: string, ...heights: readonly number[]): void => {
  viewer().dispatchEvent(new TouchEvent(type, { bubbles: true, touches: heights.map(fingerAt(viewer())) }));
};

const droppedTo = (height: number): void => {
  touchedAt('touchstart', 300);
  touchedAt('touchmove', height);
};

const shown = async (): Promise<void> => {
  await page.viewport(412, 915);
  await render(StreetView, { view: of(RODIN), sheetHeight: of(0), source: () => PANORAMA });
  await page.getByRole('button', { name: 'See the street view' }).click();
  await page.getByRole('dialog', { name: 'Street view: Musée Rodin' }).element();
};

const property = (name: string) => (): string => getComputedStyle(viewer()).getPropertyValue(name);

describe('a finger on the street view', () => {
  it('closes it when it drops past 110 px', async () => {
    await shown();
    droppedTo(450);
    touchedAt('touchend');

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('leaves it open when it drops 100 px', async () => {
    await shown();
    droppedTo(400);
    touchedAt('touchend');

    await expect.element(page.getByRole('dialog')).toBeVisible();
  });

  it('takes the picture down with it', async () => {
    await shown();
    droppedTo(400);

    await expect.poll(property('--drop')).toBe('100px');
  });

  it('fades the picture as it drops', async () => {
    await shown();
    droppedTo(550);

    await expect.poll(property('--fade')).toBe('0.5');
  });

  it('stops the picture from scrolling as it drops', async () => {
    await shown();
    droppedTo(400);

    await expect.poll(() => viewer().classList.contains('dropping')).toBe(true);
  });

  it('puts the picture back when it leaves the screen', async () => {
    await shown();
    droppedTo(400);
    touchedAt('touchcancel');

    await expect.poll(property('--drop')).toBe('0px');
  });
});
