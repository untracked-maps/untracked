import { BehaviorSubject, map, type Observable } from 'rxjs';

type TallestSheet = {
  readonly of: (sheet: string) => (height: number) => void;
  readonly tallest: Observable<number>;
};

const tallestSheet = (): TallestSheet => {
  const heights = new BehaviorSubject<Readonly<Record<string, number>>>({});
  return {
    of: (sheet) => (height) => heights.next({ ...heights.getValue(), [sheet]: height }),
    tallest: heights.pipe(map((told) => Math.max(0, ...Object.values(told))))
  };
};

export { type TallestSheet, tallestSheet };
