import { catchError, combineLatest, map, type Observable, of, switchMap, take } from 'rxjs';
import type { FindFound } from '../../../domain/found';
import type { KnownAddress } from './known-address';
import type { WithAddresses } from './with-addresses';

type LoadAddresses = () => Observable<readonly KnownAddress[]>;

type IndexAddresses = (addresses: readonly KnownAddress[]) => Observable<WithAddresses>;

type FindAddressPorts = {
  readonly loadAddresses: LoadAddresses;
  readonly indexAddresses: IndexAddresses;
};

const PLACES_ONLY: WithAddresses = (findPlaces) => findPlaces;

const findAddress =
  ({ loadAddresses, indexAddresses }: FindAddressPorts) =>
  (findPlaces$: Observable<FindFound>): Observable<FindFound> =>
    combineLatest([
      findPlaces$,
      loadAddresses().pipe(
        switchMap(indexAddresses),
        take(1),
        catchError(() => of(PLACES_ONLY))
      )
    ]).pipe(map(([findPlaces, withAddresses]) => withAddresses(findPlaces)));

export { findAddress, type IndexAddresses, type LoadAddresses };
