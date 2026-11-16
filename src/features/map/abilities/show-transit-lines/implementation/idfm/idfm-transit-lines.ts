import { defer, type Observable, switchMap } from 'rxjs';
import type { LoadTransitLines, TransitLine } from '../../domain/show-transit-lines';
import type { FetchFile } from './transit-lines-file';

const idfmTransitLines =
  (fetchFile: FetchFile): LoadTransitLines =>
  (): Observable<readonly TransitLine[]> =>
    defer(() => import('./transit-lines-file')).pipe(switchMap((file) => file.transitLinesFrom(fetchFile)));

export { idfmTransitLines };
