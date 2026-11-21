import { createRawSnippet } from 'svelte';
import { describe, expect, it, onTestFinished } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import PopoverButton from './popover-button.svelte';

const TALL = 2000;

const icon = createRawSnippet(() => ({ render: (): string => '<svg aria-hidden="true"></svg>' }));

const short = createRawSnippet(() => ({ render: (): string => '<p>Theme</p>' }));

const tall = createRawSnippet(() => ({ render: (): string => `<p style="block-size: ${TALL}px">Theme</p>` }));

const button = (): Element => page.getByRole('button', { name: 'Map type' }).element();

const panel = (): Element => page.getByText('Theme').element().closest('[data-menu-panel]') ?? document.body;

const box = (element: Element): DOMRect => element.getBoundingClientRect();

const opened = async (children = short, pointerEvents = 'auto'): Promise<void> => {
  await page.viewport(375, 667);
  const { container } = await render(PopoverButton, { label: 'Map type', icon, children });
  container.style.pointerEvents = pointerEvents;
  await page.getByRole('button', { name: 'Map type' }).click();
  await expect.element(page.getByText('Theme')).toBeVisible();
};

const touchedAt = (x: number, y: number): Promise<void> =>
  page.getByRole('dialog', { name: 'Map type' }).click({ position: { x, y } });

const outsideButton = (pressed: string[]): HTMLButtonElement => {
  const element = document.createElement('button');
  element.textContent = 'Under the menu';
  element.style.cssText = 'position: fixed; inset: auto 0 0 auto; inline-size: 100px; block-size: 100px';
  element.onclick = (): void => {
    pressed.push('pressed');
  };
  document.body.append(element);
  onTestFinished(() => element.remove());
  return element;
};

describe('a menu in a layer that lets touches through to the map', () => {
  it('closes when touched outside', async () => {
    await opened(short, 'none');

    await touchedAt(300, 600);

    await expect.element(page.getByRole('dialog', { name: 'Map type' })).not.toBeInTheDocument();
  });
});

describe('a menu touched outside', () => {
  it('closes', async () => {
    await opened();

    await touchedAt(300, 600);

    await expect.element(page.getByRole('dialog', { name: 'Map type' })).not.toBeInTheDocument();
  });

  it('does not trigger what is under the touch', async () => {
    const pressed: string[] = [];
    outsideButton(pressed);
    await opened();

    await touchedAt(330, 620);

    expect(pressed).toEqual([]);
  });

  it('stays open when its own content is touched', async () => {
    await opened();

    await page.getByText('Theme').click();

    await expect.element(page.getByRole('dialog', { name: 'Map type' })).toBeVisible();
  });

  it('closes when its button is touched again', async () => {
    await opened();
    const { left, top } = box(button());

    await touchedAt(left + 10, top + 10);

    await expect.element(page.getByRole('dialog', { name: 'Map type' })).not.toBeInTheDocument();
  });
});

describe('a menu on a small screen', () => {
  it('stands 8 px below its button when there is no room above it', async () => {
    await opened();

    expect(box(panel()).top).toBe(box(button()).bottom + 8);
  });

  it('stays 8 px from the bottom of the screen when it is too tall', async () => {
    await opened(tall);

    expect(box(panel()).bottom).toBe(659);
  });

  it('scrolls when it is too tall', async () => {
    await opened(tall);

    expect(getComputedStyle(panel()).overflowY).toBe('auto');
  });

  it('stays 8 px from the right of the screen', async () => {
    await opened();

    expect(box(panel()).right).toBeLessThanOrEqual(367);
  });
});
