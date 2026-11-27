import { concat, concatMap, EMPTY, ignoreElements, map, merge, type Observable, of, scan } from 'rxjs';

const CLOSING_ORDER = [
  'about',
  'photo viewer',
  'map menu',
  'place window',
  'spot',
  'place',
  'district',
  'kind list',
  'search'
] as const;

type Closable = (typeof CLOSING_ORDER)[number];

type Report = {
  readonly element: Closable;
  readonly open: boolean;
};

type HistoryEntry = {
  readonly add: () => Observable<unknown>;
  readonly leave: () => Observable<unknown>;
};

type CloseWhatIsOpenPorts = {
  readonly entry: HistoryEntry;
};

type CloseWhatIsOpenInputs = {
  readonly reports: Observable<Report>;
  readonly escapes: Observable<unknown>;
  readonly steps: Observable<unknown>;
};

type Happening =
  | { readonly kind: 'reported'; readonly report: Report }
  | { readonly kind: 'escaped' }
  | { readonly kind: 'stepped' };

type EntryChange = keyof HistoryEntry;

type State = {
  readonly open: readonly Closable[];
  readonly entryAdded: boolean;
  readonly leaving: boolean;
  readonly closing?: Closable;
  readonly entryChange?: EntryChange;
};

type Kept = Pick<State, 'open' | 'entryAdded' | 'leaving'>;

const NOTHING_OPEN: State = { open: [], entryAdded: false, leaving: false };

const ESCAPED: Happening = { kind: 'escaped' };

const STEPPED: Happening = { kind: 'stepped' };

const reported = (report: Report): Happening => ({ kind: 'reported', report });

const without = (open: readonly Closable[], element: Closable | undefined): readonly Closable[] =>
  open.filter((other) => other !== element);

const openAfter = (open: readonly Closable[], report: Report): readonly Closable[] =>
  report.open ? [...open, report.element] : without(open, report.element);

const topOf = (open: readonly Closable[]): Closable | undefined => CLOSING_ORDER.find((element) => open.includes(element));

const closingTop = (kept: Kept): State => {
  const top = topOf(kept.open);
  return top === undefined ? kept : { ...kept, closing: top };
};

const withEntryFor = (state: State, open: readonly Closable[]): State =>
  open.length > 0 ? { ...state, entryAdded: true, entryChange: 'add' } : state;

const afterReport = ({ entryAdded, leaving }: Kept, open: readonly Closable[]): State => {
  if (!entryAdded) {
    return withEntryFor({ open, entryAdded, leaving }, open);
  }
  return open.length === 0 && !leaving
    ? { open, entryAdded, leaving: true, entryChange: 'leave' }
    : { open, entryAdded, leaving };
};

const afterStep = ({ open, leaving }: Kept): State => {
  const stepped = { open, entryAdded: false, leaving: false };
  const state: State = leaving ? stepped : closingTop(stepped);
  return withEntryFor(state, without(open, state.closing));
};

const next = ({ open, entryAdded, leaving }: State, happening: Happening): State => {
  if (happening.kind === 'reported') {
    return afterReport({ open, entryAdded, leaving }, openAfter(open, happening.report));
  }
  return happening.kind === 'escaped' ? closingTop({ open, entryAdded, leaving }) : afterStep({ open, entryAdded, leaving });
};

const applied =
  (entry: HistoryEntry) =>
  ({ entryChange, closing }: State): Observable<Closable> =>
    concat(
      entryChange === undefined ? EMPTY : entry[entryChange]().pipe(ignoreElements()),
      closing === undefined ? EMPTY : of(closing)
    );

const closeWhatIsOpen =
  ({ entry }: CloseWhatIsOpenPorts) =>
  ({ reports, escapes, steps }: CloseWhatIsOpenInputs): Observable<Closable> =>
    merge(reports.pipe(map(reported)), escapes.pipe(map(() => ESCAPED)), steps.pipe(map(() => STEPPED))).pipe(
      scan(next, NOTHING_OPEN),
      concatMap(applied(entry))
    );

export { type Closable, closeWhatIsOpen, type HistoryEntry, type Report };
