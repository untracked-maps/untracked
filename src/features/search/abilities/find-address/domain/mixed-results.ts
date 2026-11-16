import type { Found, FoundAddress } from '../../../domain/found';
import type { RankedAddress } from './address-book';
import type { AddressIntent } from './address-query';

const MOST_RESULTS = 7;

const MOST_CLEAN_ADDRESSES = 5;

const PLACES_AFTER_THE_FIRST_ADDRESS = 3;

const MOST_CLEAN_STREETS = 3;

const foundOf = ({ address }: RankedAddress): FoundAddress => address;

const addressesFirst = (addresses: readonly RankedAddress[], places: readonly Found[]): readonly Found[] => {
  const [first, ...others] = addresses;
  if (first === undefined) {
    return places;
  }
  return first.clean
    ? addresses.slice(0, MOST_CLEAN_ADDRESSES).map(foundOf)
    : [
        first.address,
        ...places.slice(0, PLACES_AFTER_THE_FIRST_ADDRESS),
        ...others.map(foundOf),
        ...places.slice(PLACES_AFTER_THE_FIRST_ADDRESS)
      ].slice(0, MOST_RESULTS);
};

const streetsFirst = (streets: readonly RankedAddress[], places: readonly Found[]): readonly Found[] => {
  const clean = streets.filter((street) => street.clean).slice(0, MOST_CLEAN_STREETS);
  return [...clean.map(foundOf), ...places, ...streets.filter((street) => !clean.includes(street)).map(foundOf)].slice(
    0,
    MOST_RESULTS
  );
};

const mixedResults = (
  intent: Exclude<AddressIntent, 'none'>,
  addresses: readonly RankedAddress[],
  places: readonly Found[]
): readonly Found[] => (intent === 'address' ? addressesFirst(addresses, places) : streetsFirst(addresses, places));

export { mixedResults };
