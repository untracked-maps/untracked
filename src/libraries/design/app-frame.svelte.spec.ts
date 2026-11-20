import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import AppFrame from './app-frame.svelte';

const text = (content: string): ReturnType<typeof createRawSnippet> =>
  createRawSnippet(() => ({ render: (): string => `<p>${content}</p>` }));

const props = { children: text('Content'), bottom: text('Bottom') };

describe('app frame', () => {
  it('puts the content in the main landmark', async () => {
    await render(AppFrame, props);

    await expect.element(page.getByRole('main')).toHaveTextContent('Content');
  });

  it('puts the bottom in the footer landmark', async () => {
    await render(AppFrame, props);

    await expect.element(page.getByRole('contentinfo')).toHaveTextContent('Bottom');
  });

  it('keeps the bottom on the inline end, where the round buttons stack', async () => {
    await render(AppFrame, props);

    await expect.element(page.getByRole('contentinfo')).toHaveStyle({ justifyContent: 'flex-end' });
  });
});

const block = (height: number, marks = ''): string => `<div ${marks} style="block-size: ${height}px">Block</div>`;

const topBar = (height: number): string =>
  `<div data-sheet-top style="position: fixed; inset-block-start: 0; block-size: ${height}px">Bar</div>`;

const footer = (): HTMLElement | null => document.querySelector('footer');

const withSheet = async (sheetHeight: number, main = block(10)): Promise<void> => {
  await page.viewport(390, 844);
  await render(AppFrame, {
    children: createRawSnippet(() => ({ render: (): string => `<div>${main}</div>` })),
    bottom: createRawSnippet(() => ({ render: (): string => block(48) })),
    sheetHeight
  });
};

describe('what floats in the app frame', () => {
  it('rests in place without a bottom sheet', async () => {
    await withSheet(0);

    await expect.element(footer()).toHaveStyle({ translate: '0px' });
  });

  it('rises 8 px above a bottom sheet, from the 12 px edge it rests on', async () => {
    await withSheet(150);

    await expect.element(footer()).toHaveStyle({ translate: '0px -146px' });
  });

  it('stays visible while it fits above the sheet', async () => {
    await withSheet(150);

    await expect.element(footer()).toHaveStyle({ visibility: 'visible' });
  });

  it('hides when it no longer fits above the sheet', async () => {
    await withSheet(789);

    await expect.element(footer()).toHaveStyle({ visibility: 'hidden' });
  });

  it('fits exactly its 48 px and 8 px more between the sheet and the top of the screen', async () => {
    await withSheet(788);

    await expect.element(footer()).toHaveStyle({ visibility: 'visible' });
  });

  it('counts what the page stacks above the footer', async () => {
    await withSheet(150, block(640, 'data-sheet-stack'));

    await expect.element(footer()).toHaveStyle({ visibility: 'hidden' });
  });

  it('leaves room for the top bar the page marks', async () => {
    await withSheet(150, topBar(700));

    await expect.element(footer()).toHaveStyle({ visibility: 'hidden' });
  });

  it('leaves room for the lowest of the top bars', async () => {
    await withSheet(150, [100, 700, 50].map(topBar).join(''));

    await expect.element(footer()).toHaveStyle({ visibility: 'hidden' });
  });

  it('shows again once the sheet is low enough', async () => {
    await page.viewport(390, 844);
    const { rerender } = await render(AppFrame, { ...props, sheetHeight: 800 });
    await rerender({ sheetHeight: 150 });

    await expect.element(footer()).toHaveStyle({ visibility: 'visible' });
  });

  it('follows the sheet when it grows', async () => {
    await page.viewport(390, 844);
    const { rerender } = await render(AppFrame, { ...props, sheetHeight: 150 });
    await rerender({ sheetHeight: 388 });

    await expect.element(footer()).toHaveStyle({ translate: '0px -384px' });
  });
});
