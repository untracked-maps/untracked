import { fromEvent, map, type Observable, of, shareReplay, startWith } from 'rxjs';

type ShownPage = Pick<Document, 'visibilityState'> & EventTarget;

const isShown = (page: ShownPage): boolean => page.visibilityState === 'visible';

const pageShown = (page: ShownPage | undefined): Observable<boolean> =>
  page === undefined
    ? of(true)
    : fromEvent(page, 'visibilitychange').pipe(
        map(() => isShown(page)),
        startWith(isShown(page)),
        shareReplay({ bufferSize: 1, refCount: true })
      );

export { pageShown };
