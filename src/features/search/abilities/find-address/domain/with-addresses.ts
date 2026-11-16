import type { FindFound } from '../../../domain/found';
import { addressBookOf } from './address-book';
import { addressQueryOf } from './address-query';
import type { KnownAddress } from './known-address';
import { mixedResults } from './mixed-results';

type WithAddresses = (findPlaces: FindFound) => FindFound;

const withAddressesOf = (known: readonly KnownAddress[]): WithAddresses => {
  const findAddresses = addressBookOf(known);
  return (findPlaces) => (query, reference) => {
    const addressQuery = addressQueryOf(query);
    const places = findPlaces(query, reference);
    return addressQuery.intent === 'none'
      ? places
      : mixedResults(addressQuery.intent, findAddresses(addressQuery, reference), places);
  };
};

export { type WithAddresses, withAddressesOf };
