import type { AddressLine } from '#libraries/postal-address/address-line.presenter';
import type { PostalAddress, SheetPlace } from '../../domain/open-place';

const NO_ADDRESS: readonly string[] = [];

const linesOf = (line: AddressLine | undefined, address: PostalAddress | undefined): readonly string[] =>
  address === undefined || line === undefined ? NO_ADDRESS : [line(address)];

const addressOf = (line: AddressLine | undefined, place: SheetPlace | undefined): string | undefined =>
  linesOf(line, place?.address).at(0);

export { addressOf };
