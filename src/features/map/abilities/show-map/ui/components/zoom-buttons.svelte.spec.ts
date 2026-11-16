import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import ZoomButtons from './zoom-buttons.svelte';
import type { ZoomStep } from './zoom-overlay';

const pressed = async (name: string): Promise<readonly ZoomStep[]> => {
  const steps: ZoomStep[] = [];
  await render(ZoomButtons, {
    onZoom: (step: ZoomStep): void => {
      steps.push(step);
    }
  });
  await page.getByRole('button', { name }).click();
  return steps;
};

describe('zoom buttons', () => {
  it('can be pressed once ready', async () => {
    await render(ZoomButtons, { onZoom: () => undefined });

    await expect.element(page.getByRole('button', { name: 'Zoom out' })).toBeEnabled();
  });

  it('cannot zoom in until the app is ready', async () => {
    await render(ZoomButtons, { onZoom: () => undefined, ready: false });

    await expect.element(page.getByRole('button', { name: 'Zoom in' })).toBeDisabled();
  });

  it('cannot zoom out until the app is ready', async () => {
    await render(ZoomButtons, { onZoom: () => undefined, ready: false });

    await expect.element(page.getByRole('button', { name: 'Zoom out' })).toBeDisabled();
  });

  it('zoom in once the plus button is pressed', async () => {
    expect(await pressed('Zoom in')).toEqual(['in']);
  });

  it('zoom out once the minus button is pressed', async () => {
    expect(await pressed('Zoom out')).toEqual(['out']);
  });
});
