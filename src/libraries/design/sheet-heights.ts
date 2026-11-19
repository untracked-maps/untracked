type SheetStop = 'peek' | 'half' | 'full';

type SheetHeights = Readonly<Record<SheetStop, number>>;

type SheetMeasures = {
  readonly content: number;
  readonly viewport: number;
  readonly peekEnd?: number | undefined;
};

const SHEET_STOPS: readonly SheetStop[] = ['peek', 'half', 'full'];

const MAP_STRIP = 64;

const HALF_SHARE = 0.46;

const DEFAULT_PEEK = 150;

const sheetHeights = ({ content, viewport, peekEnd = DEFAULT_PEEK }: SheetMeasures): SheetHeights => {
  const half = Math.min(content, Math.round(viewport * HALF_SHARE));
  return { peek: Math.min(half, peekEnd), half, full: Math.min(content, viewport - MAP_STRIP) };
};

const stopAbove = (stop: SheetStop, heights: SheetHeights): SheetStop =>
  SHEET_STOPS.find((candidate) => heights[candidate] > heights[stop]) ?? stop;

const stopBelow = (stop: SheetStop, heights: SheetHeights): SheetStop =>
  SHEET_STOPS.findLast((candidate) => heights[candidate] < heights[stop]) ?? stop;

const nearestStop = (height: number, heights: SheetHeights): SheetStop =>
  SHEET_STOPS.reduce((nearest, candidate) =>
    Math.abs(heights[candidate] - height) < Math.abs(heights[nearest] - height) ? candidate : nearest
  );

const hasGrip = (heights: SheetHeights): boolean => heights.full > heights.peek;

const settledStop = (stop: SheetStop, heights: SheetHeights): SheetStop =>
  stop === 'full' && heights.full <= heights.half ? 'half' : stop;

export { hasGrip, nearestStop, type SheetHeights, type SheetStop, settledStop, sheetHeights, stopAbove, stopBelow };
