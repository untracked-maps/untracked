import { catchError, defer, distinctUntilChanged, type Observable, of, shareReplay, switchMap } from 'rxjs';

type TransitMode = 'metro' | 'rer' | 'train' | 'tram' | 'other';

type TransitLine = {
  readonly mode: TransitMode;
  readonly colour: string | undefined;
  readonly path: readonly (readonly [longitude: number, latitude: number])[];
};

type ShownTransitLines = () => Observable<boolean>;

type LoadTransitLines = () => Observable<readonly TransitLine[]>;

type ShowTransitLinesPorts = {
  readonly shownTransitLines: ShownTransitLines;
  readonly loadTransitLines: LoadTransitLines;
};

const showTransitLines = ({
  shownTransitLines,
  loadTransitLines
}: ShowTransitLinesPorts): (() => Observable<readonly TransitLine[] | undefined>) => {
  const lines$ = defer(loadTransitLines).pipe(shareReplay(1));
  return () =>
    shownTransitLines().pipe(
      distinctUntilChanged(),
      switchMap((shown: boolean) => (shown ? lines$.pipe(catchError(() => of(undefined))) : of(undefined)))
    );
};

export { type LoadTransitLines, showTransitLines, type TransitLine, type TransitMode };
