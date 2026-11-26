import { filter, map, type Observable, Subject, shareReplay, startWith } from 'rxjs';
import { type Located, type LocateMeStatus, locateMe } from '#features/map/abilities/locate-me/domain/locate-me';
import { inMemoryLocate } from '#features/map/abilities/locate-me/implementation/in-memory/in-memory-locate';

type Position = Located['position'];

type Locating = {
  readonly located: Observable<LocateMeStatus>;
  readonly locate: () => void;
  readonly position: Observable<Position | undefined>;
};

const isLocated = (status: LocateMeStatus): status is Extract<LocateMeStatus, { readonly kind: 'located' }> =>
  status.kind === 'located';

const positionOf = (located: Observable<LocateMeStatus>): Observable<Position | undefined> =>
  located.pipe(
    filter(isLocated),
    map(({ view }): Position | undefined => view.center),
    startWith(undefined),
    shareReplay(1)
  );

const locating = (fake: () => Located): Locating => {
  const requests = new Subject<void>();
  const located = locateMe({ locate: () => inMemoryLocate(fake())() })(requests);
  return { located, locate: (): void => requests.next(), position: positionOf(located) };
};

export { locating, type Position };
