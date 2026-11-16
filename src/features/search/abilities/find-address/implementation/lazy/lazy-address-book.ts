import { from, map, type Observable } from 'rxjs';
import type { IndexAddresses } from '../../domain/find-address';
import type { KnownAddress } from '../../domain/known-address';
import type { WithAddresses } from '../../domain/with-addresses';

const lazyAddressBook: IndexAddresses = (addresses: readonly KnownAddress[]): Observable<WithAddresses> =>
  from(import('../../domain/with-addresses')).pipe(map(({ withAddressesOf }) => withAddressesOf(addresses)));

export { lazyAddressBook };
