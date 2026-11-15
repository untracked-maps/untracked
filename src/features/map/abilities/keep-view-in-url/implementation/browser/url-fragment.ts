import { from, map, type Observable, of } from 'rxjs';
import type { ReadFragment, WriteFragment } from '../../domain/keep-view-in-url';

type ReplaceUrl = (url: string) => Promise<void>;

const locationFragment =
  (location: Pick<Location, 'hash'>): ReadFragment =>
  (): Observable<string> =>
    of(location.hash.slice(1));

const replacedFragment =
  (replaceUrl: ReplaceUrl): WriteFragment =>
  (fragment: string): Observable<string> =>
    from(replaceUrl(`#${fragment}`)).pipe(map(() => fragment));

export { locationFragment, replacedFragment };
