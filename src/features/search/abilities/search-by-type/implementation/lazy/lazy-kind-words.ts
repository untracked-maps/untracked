import { from, map, type Observable } from 'rxjs';
import type { FindKind } from '../../domain/kind-words';
import type { LoadKindFinder } from '../../domain/named-kind';

const lazyKindWords: LoadKindFinder = (): Observable<FindKind> =>
  from(import('../../domain/kind-words')).pipe(map(({ kindNamedIn }) => kindNamedIn));

export { lazyKindWords };
