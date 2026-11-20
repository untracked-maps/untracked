import { type ComponentProps, createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import BottomSheet from './bottom-sheet.svelte';

type Point = readonly [x: number, y: number];

const CONTENT_HEIGHT = 2000;

const children = createRawSnippet(() => ({
  render: (): string => `<div style="block-size: ${CONTENT_HEIGHT}px"><p>Details</p><p data-sheet-sideways>Photos</p></div>`
}));

type SheetProps = Partial<ComponentProps<typeof BottomSheet>>;

const labels = { growLabel: 'Enlarge the sheet', reduceLabel: 'Reduce the sheet' };

const sheetElement = (): HTMLElement | null => page.getByText('Details').element().closest<HTMLElement>('.sheet');

const scroller = (): Element => page.getByText('Details').element().closest('.scroller') ?? document.body;

const finger = (type: string, on: Element, points: readonly Point[]): void => {
  const touches = points.map(([clientX, clientY], identifier) => new Touch({ identifier, target: on, clientX, clientY }));
  on.dispatchEvent(new TouchEvent(type, { bubbles: true, touches }));
};

const shown = async (props: SheetProps = {}): Promise<void> => {
  await page.viewport(390, 844);
  await render(BottomSheet, { ...labels, children, ...props });
  await expect.element(sheetElement()).not.toHaveStyle({ blockSize: '0px' });
};

const dragged = async (from: Point, to: Point, on = 'Details', props: SheetProps = {}): Promise<void> => {
  await shown(props);
  finger('touchstart', page.getByText(on).element(), [from]);
  finger('touchmove', page.getByText(on).element(), [to]);
};

const pause = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

describe('a finger on a bottom sheet', () => {
  it('drags the sheet up', async () => {
    await dragged([100, 500], [100, 400]);

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '488px' });
  });

  it('drags the sheet at once, without the animation between two heights', async () => {
    await dragged([100, 500], [100, 400]);

    await expect.element(sheetElement()).toHaveStyle({ transitionProperty: 'none' });
  });

  it('never moves the sheet when it goes sideways', async () => {
    await dragged([100, 500], [160, 480]);

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '388px' });
  });

  it('moves the sheet when it goes a little sideways', async () => {
    await dragged([100, 500], [110, 475]);

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '413px' });
  });

  it('does not move the sheet from a row that scrolls sideways when it goes a little sideways', async () => {
    await dragged([100, 500], [110, 475], 'Photos');

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '388px' });
  });

  it('does not drag the sheet with a second finger down', async () => {
    await shown();
    finger('touchstart', scroller(), [
      [100, 500],
      [200, 500]
    ]);
    finger('touchmove', scroller(), [[100, 400]]);

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '388px' });
  });

  it('ignores a touch that no finger makes', async () => {
    await shown();
    finger('touchstart', scroller(), []);
    finger('touchmove', scroller(), [[100, 400]]);

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '388px' });
  });

  it('ignores a move that no finger makes', async () => {
    await shown();
    finger('touchstart', scroller(), [[100, 500]]);
    finger('touchmove', scroller(), []);

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '388px' });
  });

  it('pulls a full sheet down from the top of its content', async () => {
    await dragged([100, 300], [100, 500], 'Details', { opening: 'full' });

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '580px' });
  });

  it('scrolls the content of a full sheet back before it pulls the sheet down', async () => {
    await shown({ opening: 'full' });
    scroller().scrollTo({ top: 300 });
    finger('touchstart', scroller(), [[100, 300]]);
    finger('touchmove', scroller(), [[100, 500]]);

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '780px' });
  });
});

describe('a finger lifted from a bottom sheet', () => {
  it('sends the sheet one stop up after a flick', async () => {
    await dragged([100, 500], [100, 440]);
    finger('touchend', scroller(), []);

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '780px' });
  });

  it('leaves the sheet on the nearest stop after a slow gesture', async () => {
    await dragged([100, 500], [100, 440]);
    await pause(400);
    finger('touchend', scroller(), []);

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '388px' });
  });

  it('animates the sheet to its stop again', async () => {
    await dragged([100, 500], [100, 440]);
    finger('touchend', scroller(), []);

    await expect.element(sheetElement()).toHaveStyle({ transitionProperty: 'block-size' });
  });

  it('settles the sheet as well when the gesture is cancelled', async () => {
    await dragged([100, 500], [100, 440]);
    finger('touchcancel', scroller(), []);

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '780px' });
  });
});

describe('the wheel over a bottom sheet', () => {
  it('grows the sheet to full when it turns down', async () => {
    await shown();
    scroller().dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 40 }));

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '780px' });
  });

  it('leaves the sheet as it is when it turns up', async () => {
    await shown();
    scroller().dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: -40 }));

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '388px' });
  });

  it('leaves the sheet as it is when it does not turn', async () => {
    await shown();
    scroller().dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 0 }));

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '388px' });
  });
});

describe('a bottom sheet leaving its full height', () => {
  it('puts its content back at the top', async () => {
    await shown({ opening: 'full' });
    await pause(400);
    scroller().scrollTo({ top: 300 });
    page
      .getByRole('button', { name: 'Reduce the sheet' })
      .element()
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await pause(400);

    expect(scroller().scrollTop).toBe(0);
  });

  it('keeps its content where it is while it stays full', async () => {
    await shown({ opening: 'full' });
    scroller().scrollTo({ top: 300 });
    scroller().dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 40 }));
    await pause(100);

    expect(scroller().scrollTop).toBe(300);
  });
});
