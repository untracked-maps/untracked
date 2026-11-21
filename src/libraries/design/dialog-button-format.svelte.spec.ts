import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DialogButton from './dialog-button.svelte';

const icon = createRawSnippet(() => ({ render: (): string => '<svg aria-hidden="true"></svg>' }));

const LARGE = 2000;

const tall = createRawSnippet(() => ({
  render: (): string => `<p style="block-size: ${LARGE}px; inline-size: ${LARGE}px">Sources</p>`
}));

const short = createRawSnippet(() => ({ render: (): string => '<p>Sources</p>' }));

const props = { label: 'About this map', title: 'Untracked Maps', closeLabel: 'Close', icon };

const opened = async (width: number, height: number, children = tall): Promise<Element> => {
  await page.viewport(width, height);
  await render(DialogButton, { ...props, children });
  await page.getByRole('button', { name: 'About this map' }).click();
  return page.getByRole('dialog').element();
};

const onPhone = (children = tall): Promise<Element> => opened(390, 844, children);

const onLargeScreen = (children = tall): Promise<Element> => opened(1024, 768, children);

const style = (element: Element, pseudo?: string): CSSStyleDeclaration => getComputedStyle(element, pseudo);

const box = (element: Element): DOMRect => element.getBoundingClientRect();

const closeButton = (): Element => page.getByRole('button', { name: 'Close' }).element();

const handle = (dialog: Element): Element => dialog.querySelector('[data-dialog-handle]') ?? dialog;

describe('a window on a phone', () => {
  it('stands on the bottom of the screen', async () => {
    const dialog = await onPhone();

    expect(box(dialog).bottom).toBe(844);
  });

  it('takes the whole width of the screen', async () => {
    const dialog = await onPhone();

    expect(box(dialog).width).toBe(390);
  });

  it('takes 92 % of the height of the screen at most', async () => {
    const dialog = await onPhone();

    expect(Math.round(box(dialog).height)).toBe(776);
  });

  it('rounds its top corners by 22 px', async () => {
    const dialog = await onPhone();

    expect(style(dialog).borderTopLeftRadius).toBe('22px');
  });

  it('keeps its bottom corners square', async () => {
    const dialog = await onPhone();

    expect(style(dialog).borderBottomRightRadius).toBe('0px');
  });

  it('shows a handle 38 px wide', async () => {
    const dialog = await onPhone();

    expect(box(handle(dialog)).width).toBe(38);
  });

  it('shows a handle 5 px high', async () => {
    const dialog = await onPhone();

    expect(box(handle(dialog)).height).toBe(5);
  });

  it('stays at the bottom of a phone held sideways only on a narrow screen', async () => {
    const dialog = await opened(540, 360);

    expect(box(dialog).bottom).toBe(360);
  });
});

describe('a window on a large screen', () => {
  it('stands in the middle of the screen across', async () => {
    const dialog = await onLargeScreen(short);

    expect(box(dialog).left + box(dialog).width / 2).toBe(512);
  });

  it('stands in the middle of the screen down', async () => {
    const dialog = await onLargeScreen(short);

    expect(Math.round(box(dialog).top + box(dialog).height / 2)).toBe(384);
  });

  it('is 420 px wide at most', async () => {
    const dialog = await onLargeScreen();

    expect(box(dialog).width).toBe(420);
  });

  it('leaves 32 px of the height of the screen around it at least', async () => {
    const dialog = await onLargeScreen();

    expect(box(dialog).height).toBe(736);
  });

  it('rounds its corners by 20 px', async () => {
    const dialog = await onLargeScreen();

    expect(style(dialog).borderBottomRightRadius).toBe('20px');
  });

  it('leaves 20 px around its content, 22 px below', async () => {
    const dialog = await onLargeScreen();

    expect(style(dialog).padding).toBe('20px 20px 22px');
  });

  it('shows no handle', async () => {
    const dialog = await onLargeScreen();

    expect(style(handle(dialog)).display).toBe('none');
  });

  it('stands in the middle of a phone held sideways', async () => {
    const dialog = await opened(844, 390, short);

    expect(box(dialog).left + box(dialog).width / 2).toBe(422);
  });
});

describe('the heading of a window', () => {
  it('shows the title at 19 px', async () => {
    await onPhone();

    expect(style(page.getByRole('heading', { name: 'Untracked Maps' }).element()).fontSize).toBe('19px');
  });

  it('has a round close button of 32 px', async () => {
    await onPhone();

    expect(box(closeButton()).width).toBe(32);
  });

  it('puts the close button 12 px from the top of the window', async () => {
    const dialog = await onLargeScreen();

    expect(box(closeButton()).top - box(dialog).top).toBe(12);
  });

  it('puts the close button 12 px from the right of the window', async () => {
    const dialog = await onLargeScreen();

    expect(box(dialog).right - box(closeButton()).right).toBe(12);
  });

  it('closes the window from 6 px beside the close button', async () => {
    await onLargeScreen();
    const { left, top } = box(closeButton());

    expect(document.elementFromPoint(left - 5, top - 5)?.closest('button')).toBe(closeButton());
  });
});

describe('a window opening', () => {
  it('opens at once, without an animation', async () => {
    const dialog = await onPhone();

    expect(dialog.getAnimations({ subtree: true })).toHaveLength(0);
  });

  it('closes when the backdrop is touched', async () => {
    await onLargeScreen(short);

    await page.elementLocator(document.body).click({ position: { x: 10, y: 10 } });

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('stays open when the window itself is touched', async () => {
    await onLargeScreen(short);

    await page.getByText('Sources').click();

    await expect.element(page.getByRole('dialog')).toBeVisible();
  });
});
