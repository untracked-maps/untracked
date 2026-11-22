import type { Coordinates, Place, PostalAddress } from './place';

const ADDRESS_KINDS = ['address', 'street', 'district'] as const;

type AddressKind = (typeof ADDRESS_KINDS)[number];

type FoundAddress = {
  readonly id: string;
  readonly name: string;
  readonly kind: AddressKind;
  readonly address: PostalAddress;
  readonly coordinates: Coordinates;
};

type Found = Place | FoundAddress;

type FindFound = (query: string, reference: Coordinates) => readonly Found[];

const KNOWN_ADDRESS_KINDS: ReadonlySet<string> = new Set(ADDRESS_KINDS);

const isAddress = ({ kind }: Pick<Found, 'kind'>): boolean => KNOWN_ADDRESS_KINDS.has(kind);

export { ADDRESS_KINDS, type AddressKind, type FindFound, type Found, type FoundAddress, isAddress };
