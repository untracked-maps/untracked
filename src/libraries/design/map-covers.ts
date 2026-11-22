type SheetCover =
  | { readonly layout: 'bottom'; readonly height: number }
  | { readonly layout: 'side'; readonly width: number; readonly end: number };

type MapCovers = {
  readonly topBarBottom: number;
  readonly sheet: SheetCover;
};

const SHEET_AT_THE_BOTTOM = '(width <= 699px) and (orientation: portrait), (width <= 559px)';

const elementsOf = (root: ParentNode, selector: string): readonly HTMLElement[] => [
  ...root.querySelectorAll<HTMLElement>(selector)
];

const largest = (values: readonly number[]): number => Math.max(0, ...values);

const heightOf = (sheet: HTMLElement): number => Number.parseFloat(sheet.style.getPropertyValue('--sheet-height'));

const sheetCoverOf = (sheets: readonly HTMLElement[]): SheetCover => {
  const boxes = sheets.map((sheet) => sheet.getBoundingClientRect());
  return matchMedia(SHEET_AT_THE_BOTTOM).matches
    ? { layout: 'bottom', height: largest(sheets.map(heightOf)) }
    : { layout: 'side', width: largest(boxes.map(({ width }) => width)), end: largest(boxes.map(({ right }) => right)) };
};

const mapCoversOf = (root: ParentNode): MapCovers => ({
  topBarBottom: largest(elementsOf(root, '[data-sheet-top]').map((bar) => bar.getBoundingClientRect().bottom)),
  sheet: sheetCoverOf(elementsOf(root, '[data-sheet-open]'))
});

export { mapCoversOf };
