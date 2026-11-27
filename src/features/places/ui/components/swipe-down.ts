type Spot = {
  readonly x: number;
  readonly y: number;
};

type Swipe = 'undecided' | 'dropping' | 'scrolling';

const DECIDING_DISTANCE = 12;

const MORE_VERTICAL = 1.3;

const CLOSING_DROP = 110;

const FADE_DROP = 500;

const FAINTEST = 0.3;

const swipeOf = (from: Spot, to: Spot): Swipe => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) <= DECIDING_DISTANCE) {
    return 'undecided';
  }
  return dy > MORE_VERTICAL * Math.abs(dx) ? 'dropping' : 'scrolling';
};

const dropOf = (from: Spot, to: Spot): number => Math.max(0, to.y - from.y);

const closesAfter = (drop: number): boolean => drop > CLOSING_DROP;

const touchPoints = (touches: ArrayLike<Pick<Touch, 'clientX' | 'clientY'>>): readonly Spot[] =>
  Array.from(touches, (touch) => ({ x: touch.clientX, y: touch.clientY }));

const fadeAfter = (drop: number): number => Math.max(FAINTEST, 1 - drop / FADE_DROP);

export { closesAfter, dropOf, fadeAfter, type Swipe, swipeOf, touchPoints };
