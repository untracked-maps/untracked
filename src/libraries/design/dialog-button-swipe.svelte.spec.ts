import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { commands, type Locator, page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DialogButton from './dialog-button.svelte';

type Point = readonly [x: number, y: number];

const icon = createRawSnippet(() => ({ render: (): string => '<svg aria-hidden="true"></svg>' }));

const CONTENT_HEIGHT = 2000;

const children = createRawSnippet(() => ({
  render: (): string => `<div style="block-size: ${CONTENT_HEIGHT}px"><p>Sources</p><input aria-label="Name" /></div>`
}));

const props = { label: 'About this map', title: 'Untracked Maps', closeLabel: 'Close', icon, children };

const dialog = (): Locator => page.getByRole('dialog');

const touchAt =
  (target: Element) =>
  ([clientX, clientY]: Point): Touch =>
    new Touch({ identifier: 0, target, clientX, clientY });

const finger = (type: string, on: Element, at: readonly Point[]): boolean =>
  on.dispatchEvent(new TouchEvent(type, { bubbles: true, touches: at.map(touchAt(on)) }));

const opened = async (width = 390, height = 844): Promise<void> => {
  await page.viewport(width, height);
  await render(DialogButton, props);
  await page.getByRole('button', { name: 'About this map' }).click();
};

const swiped = (dy: number, on = 'Sources'): void => {
  const target = on === 'Name' ? page.getByRole('textbox', { name: 'Name' }).element() : page.getByText(on).element();
  finger('touchstart', target, [[100, 300]]);
  finger('touchmove', target, [[100, 300 + dy]]);
};

const lifted = (on = 'Sources'): boolean => finger('touchend', page.getByText(on).element(), []);

const pause = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const slidingTo = (): unknown =>
  dialog()
    .element()
    .getAnimations()
    .map(({ effect }) => effect)
    .filter((effect) => effect instanceof KeyframeEffect)
    .flatMap((effect) => effect.getKeyframes())
    .at(-1)?.['translate'];

const MOVED_50 = '0px 50px';

const IN_PLACE = '0px';

describe('a window swiped down on a phone', () => {
  it('follows the finger', async () => {
    await opened();

    swiped(50);

    await expect.element(dialog()).toHaveStyle({ translate: MOVED_50 });
  });

  it('follows the finger at once, without an animation', async () => {
    await opened();

    swiped(50);

    await expect.element(dialog()).toHaveStyle({ transitionDuration: '0s' });
  });

  it('fades the backdrop as it goes down', async () => {
    await opened();

    swiped(100);

    await expect.poll(() => getComputedStyle(dialog().element(), '::backdrop').backgroundColor).toBe('rgba(0, 0, 0, 0.3)');
  });
});

describe('a window that does not follow a swipe on a phone', () => {
  it('does not move when the swipe starts from a text field', async () => {
    await opened();

    swiped(50, 'Name');

    await expect.element(dialog()).toHaveStyle({ translate: IN_PLACE });
  });

  it('does not move when its content is not scrolled to the top', async () => {
    await opened();
    dialog().element().scrollTop = 100;

    swiped(50);

    await expect.element(dialog()).toHaveStyle({ translate: IN_PLACE });
  });
});

describe('a window lifted after a swipe on a phone', () => {
  it('comes back when lifted after a short and slow swipe', async () => {
    await opened();
    swiped(50);
    await pause(400);

    lifted();

    await expect.element(dialog()).toHaveStyle({ translate: IN_PLACE });
  });

  it('comes back with a slide', async () => {
    await opened();
    swiped(50);
    await pause(400);

    lifted();

    await expect.element(dialog()).toHaveStyle({ transition: 'translate 0.2s' });
  });

  it('closes when lifted after a long swipe', async () => {
    await opened();
    swiped(120);

    lifted();

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('slides out of the screen when it closes', async () => {
    await opened();
    swiped(120);

    lifted();

    await expect.poll(slidingTo).toBe('0px 100%');
  });

  it('stays on the screen while it slides out', async () => {
    await opened();
    swiped(120);

    lifted();

    expect(dialog().element().hasAttribute('open')).toBe(true);
  });
});

describe('a window swiped away on a phone', () => {
  it('closes at once when motion is reduced', async () => {
    await commands.reduceMotion(true);
    await opened();
    swiped(120);
    lifted();

    await pause(20);

    expect(page.getByRole('dialog').query()).toBeNull();
  });

  it('opens again where it belongs once swiped away', async () => {
    await opened();
    swiped(120);
    lifted();
    await vi.waitUntil(() => page.getByRole('dialog').query() === null);

    await page.getByRole('button', { name: 'About this map' }).click();

    await expect.element(dialog()).toHaveStyle({ translate: IN_PLACE });
  });
});
