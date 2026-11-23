import { concat, concatMap, defaultIfEmpty, filter, first, map, type Observable, of, skipWhile, switchMap } from 'rxjs';
import type { ViewInUrlPorts } from './keep-view-in-url';
import { type Coordinates, type Linked, linkOfFragment } from './link-fragment';

const isLink = (link: Linked | undefined): link is Linked => link !== undefined;

const linkInUrl =
  ({ readFragment }: ViewInUrlPorts) =>
  (): Observable<Linked> =>
    readFragment().pipe(map(linkOfFragment), filter(isLink));

type PlaceLinked = {
  readonly id: string;
  readonly from: 'link';
  readonly at?: Coordinates;
};

const placeOf = (link: Linked): readonly PlaceLinked[] => {
  if (link.kind === 'point') {
    return [];
  }
  return [link.at === undefined ? { id: link.id, from: 'link' } : { id: link.id, from: 'link', at: link.at }];
};

const pointOf = (link: Linked): readonly Coordinates[] => (link.kind === 'point' ? [link.at] : []);

const placesLinked = (link$: Observable<Linked>): Observable<PlaceLinked> => link$.pipe(concatMap(placeOf));

const pointsLinked = (link$: Observable<Linked>): Observable<Coordinates> => link$.pipe(concatMap(pointOf));

const isClosed = (open: boolean): boolean => !open;

const keptUntilClosed = (open$: Observable<boolean>): Observable<boolean> =>
  concat(
    of(true),
    open$.pipe(
      skipWhile(isClosed),
      first(isClosed),
      map(() => false)
    )
  );

const linkKept = (link$: Observable<Linked>, open$: Observable<boolean>): Observable<boolean> =>
  link$.pipe(
    defaultIfEmpty(undefined),
    switchMap((link) => (link === undefined ? of(false) : keptUntilClosed(open$)))
  );

export { linkInUrl, linkKept, placesLinked, pointsLinked };
