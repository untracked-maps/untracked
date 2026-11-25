import type { FoundAddress } from '../../../domain/found';
import type { Coordinates } from '../../../domain/place';
import { normalised } from '../../../domain/text';
import { indexedWordsOf, significantWordCountOf } from '../../../domain/words';

type KnownAddress =
  | {
      readonly kind: 'address';
      readonly number: string;
      readonly street: string;
      readonly postcode: string;
      readonly city: string;
      readonly country: string;
      readonly coordinates: Coordinates;
    }
  | {
      readonly kind: 'street';
      readonly street: string;
      readonly postcode: string;
      readonly city: string;
      readonly country: string;
      readonly coordinates: Coordinates;
    }
  | {
      readonly kind: 'district';
      readonly name: string;
      readonly postcode: string;
      readonly city: string;
      readonly country: string;
      readonly coordinates: Coordinates;
    };

type AddressEntry = {
  readonly found: FoundAddress;
  readonly number: string | undefined;
  readonly postcode: string;
  readonly terms: readonly string[];
  readonly wordCount: number;
};

const slugOf = (text: string): string => normalised(text).replaceAll(' ', '-');

const capitalised = (text: string): string => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

const numberKeyOf = (number: string): string => normalised(number).replaceAll(' ', '');

const nameOf = (known: KnownAddress): string => {
  if (known.kind === 'address') {
    return `${known.number} ${known.street}`;
  }
  return known.kind === 'street' ? capitalised(known.street) : known.name;
};

const wordsOf = (known: KnownAddress): string => (known.kind === 'district' ? known.name : known.street);

const streetPartOf = (known: KnownAddress): Pick<FoundAddress['address'], 'houseNumber' | 'street'> => {
  if (known.kind === 'address') {
    return { houseNumber: known.number, street: capitalised(known.street) };
  }
  return known.kind === 'street' ? { street: capitalised(known.street) } : {};
};

const foundOf = (known: KnownAddress): FoundAddress => {
  const name = nameOf(known);
  return {
    id: `${known.kind}-${known.postcode}-${slugOf(name)}`,
    name,
    kind: known.kind,
    address: { ...streetPartOf(known), postalCode: known.postcode, addressLocality: known.city, addressCountry: known.country },
    coordinates: known.coordinates
  };
};

const entryOf = (known: KnownAddress): AddressEntry => ({
  found: foundOf(known),
  number: known.kind === 'address' ? numberKeyOf(known.number) : undefined,
  postcode: known.postcode,
  terms: indexedWordsOf(wordsOf(known)),
  wordCount: significantWordCountOf(wordsOf(known))
});

export { type AddressEntry, entryOf, type KnownAddress };
