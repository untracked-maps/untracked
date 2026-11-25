const GENERATED_KINDS = [
  'restaurant',
  'cafe',
  'bar',
  'bakery',
  'pharmacy',
  'supermarket',
  'hairdresser',
  'beauty-salon',
  'florist',
  'bookshop',
  'hotel',
  'school',
  'parking',
  'park',
  'museum',
  'cinema',
  'library',
  'post-office',
  'hospital',
  'theatre'
] as const;

const ADDED_KINDS = [
  'fast-food',
  'ice-cream',
  'chocolate',
  'deli',
  'nightclub',
  'marketplace',
  'greengrocer',
  'cheese',
  'butcher',
  'wine',
  'clothes',
  'newsagent',
  'diy',
  'mobile-phone',
  'toys',
  'stationery',
  'music',
  'atm',
  'bank',
  'optician',
  'laundry',
  'townhall',
  'police',
  'coworking',
  'doctor',
  'veterinary',
  'pet-shop',
  'escape-game',
  'playground',
  'fitness-centre',
  'swimming-pool',
  'cemetery',
  'bicycle',
  'fuel',
  'charging-station',
  'toilets',
  'drinking-water'
] as const;

const LANDMARK_KINDS = ['attraction', 'department-store', 'garden', 'monument', 'place-of-worship', 'station'] as const;

type DrawnKind = (typeof GENERATED_KINDS)[number];

type GeneratedKind = DrawnKind | (typeof ADDED_KINDS)[number];

type FakePlaceKind = GeneratedKind | (typeof LANDMARK_KINDS)[number];

type FakePostalAddress = {
  readonly houseNumber?: string;
  readonly street: string;
  readonly postalCode: string;
  readonly addressLocality: string;
  readonly addressCountry: string;
};

type FakePlace = {
  readonly id: string;
  readonly name: string;
  readonly kind: FakePlaceKind;
  readonly cuisine?: string;
  readonly address: FakePostalAddress;
  readonly phone?: string;
  readonly website?: string;
  readonly menu?: string;
  readonly instagram?: string;
  readonly facebook?: string;
  readonly tags?: Readonly<Record<string, string>>;
  readonly coordinates: { readonly longitude: number; readonly latitude: number };
  readonly fame: number;
};

const FAKE_PLACE_KINDS: readonly FakePlaceKind[] = [...GENERATED_KINDS, ...ADDED_KINDS, ...LANDMARK_KINDS];

const KNOWN_KINDS: ReadonlySet<string> = new Set(FAKE_PLACE_KINDS);

const isFakePlaceKind = (kind: string): kind is FakePlaceKind => KNOWN_KINDS.has(kind);

export { ADDED_KINDS, type DrawnKind, type FakePlace, type FakePostalAddress, type GeneratedKind, isFakePlaceKind };
