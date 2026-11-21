type Box = {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
};

type Size = {
  readonly width: number;
  readonly height: number;
};

type MenuMeasures = {
  readonly button: Box;
  readonly menu: Size;
  readonly viewport: Size;
};

type MenuPlace = {
  readonly top: number;
  readonly left: number;
  readonly maxHeight: number;
};

const MARGIN = 8;

const GAP = 8;

const within = (value: number, lowest: number, highest: number): number => Math.max(lowest, Math.min(value, highest));

const lastLeft = ({ menu, viewport }: MenuMeasures): number => viewport.width - MARGIN - menu.width;

const lastTop = ({ menu, viewport }: MenuMeasures): number => viewport.height - MARGIN - menu.height;

const verticalTop = ({ button, menu, viewport }: MenuMeasures): number | undefined => {
  if (menu.height <= button.top - GAP - MARGIN) {
    return button.top - GAP - menu.height;
  }
  return menu.height <= viewport.height - button.bottom - GAP - MARGIN ? button.bottom + GAP : undefined;
};

const besideLeft = ({ button, menu, viewport }: MenuMeasures): number =>
  button.left > viewport.width - button.right ? button.left - GAP - menu.width : button.right + GAP;

const menuPlace = (measures: MenuMeasures): MenuPlace => {
  const maxHeight = measures.viewport.height - 2 * MARGIN;
  const top = verticalTop(measures);
  return top === undefined
    ? {
        top: within(measures.button.bottom - measures.menu.height, MARGIN, lastTop(measures)),
        left: within(besideLeft(measures), MARGIN, lastLeft(measures)),
        maxHeight
      }
    : { top, left: within(measures.button.right - measures.menu.width, MARGIN, lastLeft(measures)), maxHeight };
};

export { menuPlace };
