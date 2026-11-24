type SheetStop = 'peek' | 'half' | 'full';

type SheetHeights = Readonly<Record<SheetStop, number>>;

type SheetMeasures = {
  readonly content: number;
  readonly viewport: number;
  readonly peekEnd?: number | undefined;
  readonly noticeEnd?: number | undefined;
};

const SHEET_STOPS: readonly SheetStop[] = ['peek', 'half', 'full'];

const MAP_STRIP = 80;

const HALF_SHARE = 0.46;

const DEFAULT_PEEK = 150;

const fullHeight = (content: number, viewport: number, noticeEnd: number): number => {
  const reachingTop = viewport - MAP_STRIP;
  return content > viewport - noticeEnd ? reachingTop : Math.min(content, reachingTop);
};

const sheetHeights = ({ content, viewport, peekEnd = DEFAULT_PEEK, noticeEnd = 0 }: SheetMeasures): SheetHeights => {
  const half = Math.min(content, Math.round(viewport * HALF_SHARE), viewport - noticeEnd);
  return { peek: Math.min(half, peekEnd), half, full: fullHeight(content, viewport, noticeEnd) };
};

const stopAbove = (stop: SheetStop, heights: SheetHeights): SheetStop =>
  SHEET_STOPS.find((candidate) => heights[candidate] > heights[stop]) ?? stop;

const stopBelow = (stop: SheetStop, heights: SheetHeights): SheetStop =>
  SHEET_STOPS.findLast((candidate) => heights[candidate] < heights[stop]) ?? stop;

const nearestStop = (height: number, heights: SheetHeights): SheetStop =>
  SHEET_STOPS.reduce((nearest, candidate) =>
    Math.abs(heights[candidate] - height) < Math.abs(heights[nearest] - height) ? candidate : nearest
  );

const reachesTop = (height: number, viewport: number): boolean => height >= viewport - MAP_STRIP;

const hasGrip = (heights: SheetHeights): boolean => heights.full > heights.peek;

const settledStop = (stop: SheetStop, heights: SheetHeights): SheetStop =>
  stop === 'full' && heights.full <= heights.half ? 'half' : stop;

export { hasGrip, nearestStop, reachesTop, type SheetHeights, type SheetStop, settledStop, sheetHeights, stopAbove, stopBelow };
