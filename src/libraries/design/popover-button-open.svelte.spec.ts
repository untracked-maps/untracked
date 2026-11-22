import { createRawSnippet } from 'svelte';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { cdp, page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import PopoverButton from './popover-button.svelte';

const children = createRawSnippet(() => ({ render: (): string => '<p>Basemap</p>' }));

const icon = createRawSnippet(() => ({ render: (): string => '<svg aria-hidden="true"></svg>' }));

const button = (): Element => page.getByRole('button', { name: 'Map type' }).element();

const opened = async (): Promise<Element> => {
  await render(PopoverButton, { label: 'Map type', icon, children });
  await page.getByRole('button', { name: 'Map type' }).click();
  await expect.element(page.getByText('Basemap')).toBeVisible();
  return button();
};

const inDarkTheme = (): void => {
  document.documentElement.style.colorScheme = 'dark';
  onTestFinished(() => {
    document.documentElement.style.colorScheme = '';
  });
};

const mouseAt = async (type: 'mousePressed' | 'mouseReleased', element: Element): Promise<void> => {
  const frame = window.frameElement?.getBoundingClientRect() ?? new DOMRect(0, 0, window.innerWidth);
  const scale = frame.width / window.innerWidth;
  const { left, top, width, height } = element.getBoundingClientRect();
  await cdp().send('Input.dispatchMouseEvent', {
    type,
    x: frame.left + (left + width / 2) * scale,
    y: frame.top + (top + height / 2) * scale,
    button: 'left',
    clickCount: 1
  });
};

const pressing = async (element: Element): Promise<Element> => {
  await mouseAt('mousePressed', element);
  onTestFinished(() => mouseAt('mouseReleased', element));
  return element;
};

describe('the button of an open menu', () => {
  it('takes a pale blue background', async () => {
    const pressed = await opened();

    expect(getComputedStyle(pressed).backgroundColor).toBe('rgb(232, 238, 252)');
  });

  it('shows its icon in the accent colour', async () => {
    const pressed = await opened();

    expect(getComputedStyle(pressed).color).toBe('rgb(42, 91, 215)');
  });

  it('takes a dark blue background in the dark theme', async () => {
    inDarkTheme();
    const pressed = await opened();

    expect(getComputedStyle(pressed).backgroundColor).toBe('rgb(44, 60, 94)');
  });
});

describe('the button of a menu while pressed', () => {
  it('darkens its white background', async () => {
    await render(PopoverButton, { label: 'Map type', icon, children });
    const pressed = await pressing(button());

    expect(getComputedStyle(pressed).backgroundColor).toBe('rgb(230, 230, 230)');
  });

  it('darkens its dark background in the dark theme', async () => {
    inDarkTheme();
    await render(PopoverButton, { label: 'Map type', icon, children });
    const pressed = await pressing(button());

    expect(getComputedStyle(pressed).backgroundColor).toBe('rgb(25, 28, 32)');
  });

  it('darkens its pale blue background while its menu is open', async () => {
    const pressed = await pressing(await opened());

    expect(getComputedStyle(pressed).backgroundColor).toBe('rgb(209, 214, 227)');
  });

  it('darkens its dark blue background while its menu is open in the dark theme', async () => {
    inDarkTheme();
    const pressed = await pressing(await opened());

    expect(getComputedStyle(pressed).backgroundColor).toBe('rgb(40, 54, 85)');
  });
});

const nextFrame = (): Promise<number> =>
  new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });

const moved = (element: Element, right: number): void => {
  if (element.getBoundingClientRect().right !== right) {
    throw new Error('The button has not moved yet');
  }
};

const movedTo = async (element: Element, right: number): Promise<void> => {
  await vi.waitFor(() => moved(element, right));
  await nextFrame();
  await nextFrame();
};

const openedAside = async (): Promise<Element> => {
  await page.viewport(375, 667);
  const { container } = await render(PopoverButton, { label: 'Map type', icon, children });
  container.style.cssText = 'position: fixed; inset: auto 20px 100px auto';
  await page.getByRole('button', { name: 'Map type' }).click();
  await expect.element(page.getByText('Basemap')).toBeVisible();
  return button();
};

describe('the button of an open menu away from the corner of the screen', () => {
  it('darkens while pressed', async () => {
    const pressed = await pressing(await openedAside());

    expect(getComputedStyle(pressed).backgroundColor).toBe('rgb(209, 214, 227)');
  });

  it('darkens while pressed after the screen changed size', async () => {
    const aside = await openedAside();
    await page.viewport(600, 500);
    await movedTo(aside, 580);
    const pressed = await pressing(aside);

    expect(getComputedStyle(pressed).backgroundColor).toBe('rgb(209, 214, 227)');
  });
});
