import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import BottomSheet from './bottom-sheet.svelte';
import type { SheetStop } from './sheet-heights';

const content = (html: string): ReturnType<typeof createRawSnippet> => createRawSnippet(() => ({ render: (): string => html }));

const tall = (height: number, inner = 'Details'): ReturnType<typeof createRawSnippet> =>
  content(`<div style="block-size: ${height}px">${inner}</div>`);

const TALL = tall(2000);

const SHORT = tall(200);

const WITH_ACTIONS = tall(
  2000,
  '<p style="block-size: 100px; margin: 0">Details</p><p data-sheet-actions style="margin: 0">Actions</p>'
);

const labels = { growLabel: 'Enlarge the sheet', reduceLabel: 'Reduce the sheet' };

const sheetElement = (): HTMLElement | null => page.getByText('Details').element().closest<HTMLElement>('.sheet');

type Shown = {
  readonly children: ReturnType<typeof createRawSnippet>;
  readonly opening?: SheetStop;
};

const onPhone = async (props: Shown): Promise<void> => {
  await page.viewport(390, 844);
  await render(BottomSheet, { ...labels, ...props });
};

describe('a bottom sheet on a phone', () => {
  it('shows its content', async () => {
    await onPhone({ children: TALL });

    await expect.element(page.getByText('Details')).toBeVisible();
  });

  it('is fixed along the bottom of the screen', async () => {
    await onPhone({ children: TALL });

    await expect.element(sheetElement()).toHaveStyle({ position: 'fixed', bottom: '0px' });
  });

  it('opens on 46 % of the screen', async () => {
    await onPhone({ children: TALL });

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '388px' });
  });

  it('opens as a peek of 150 px when asked', async () => {
    await onPhone({ children: TALL, opening: 'peek' });

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '150px' });
  });

  it('peeks down to 6 px above the actions its content marks, under its 30 px grip', async () => {
    await onPhone({ children: WITH_ACTIONS, opening: 'peek' });

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '124px' });
  });

  it('is never taller than its content and its grip', async () => {
    await onPhone({ children: SHORT });

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '230px' });
  });

  it('rounds its top corners by 26 px', async () => {
    await onPhone({ children: TALL });

    await expect.element(sheetElement()).toHaveStyle({ borderTopLeftRadius: '26px' });
  });

  it('does not let its content scroll below its full height', async () => {
    await onPhone({ children: TALL });

    await expect
      .element(page.getByText('Details').element().closest<HTMLElement>('.scroller'))
      .toHaveStyle({ overflowY: 'hidden' });
  });
});

describe('the grip of a bottom sheet', () => {
  it('offers to enlarge a sheet that is not full', async () => {
    await onPhone({ children: TALL });

    await expect.element(page.getByRole('button', { name: 'Enlarge the sheet' })).toBeVisible();
  });

  it('grows the sheet to all the screen but 64 px', async () => {
    await onPhone({ children: TALL });
    await page.getByRole('button', { name: 'Enlarge the sheet' }).click();

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '780px' });
  });

  it('offers to reduce a full sheet', async () => {
    await onPhone({ children: TALL, opening: 'full' });

    await expect.element(page.getByRole('button', { name: 'Reduce the sheet' })).toBeVisible();
  });

  it('lets the content of a full sheet scroll', async () => {
    await onPhone({ children: TALL, opening: 'full' });

    await expect
      .element(page.getByText('Details').element().closest<HTMLElement>('.scroller'))
      .toHaveStyle({ overflowY: 'auto' });
  });

  it('is absent from a sheet that has a single height', async () => {
    await onPhone({ children: tall(80) });

    await expect.element(page.getByRole('button')).not.toBeInTheDocument();
  });

  it('is a bar of 36 by 5 px', async () => {
    await onPhone({ children: TALL });

    await expect
      .poll(() => {
        const bar = getComputedStyle(page.getByRole('button').query() ?? document.body, '::before');
        return [bar.inlineSize, bar.blockSize];
      })
      .toEqual(['36px', '5px']);
  });
});

describe('a bottom sheet on a large screen', () => {
  it('stays in the flow of the page', async () => {
    await page.viewport(1280, 800);
    await render(BottomSheet, { ...labels, children: TALL });

    await expect.element(sheetElement()).toHaveStyle({ position: 'static' });
  });

  it('has no grip', async () => {
    await page.viewport(1280, 800);
    await render(BottomSheet, { ...labels, children: TALL });

    await expect.element(page.getByRole('button')).not.toBeInTheDocument();
  });

  it('is as tall as its content', async () => {
    await page.viewport(1280, 800);
    await render(BottomSheet, { ...labels, children: TALL });

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '2000px' });
  });
});
