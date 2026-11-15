import { type Observable, of } from 'rxjs';
import type { Locate, LocateResult } from '../../domain/locate-me';

const inMemoryLocate =
  (result: LocateResult): Locate =>
  (): Observable<LocateResult> =>
    of(result);

export { inMemoryLocate };
