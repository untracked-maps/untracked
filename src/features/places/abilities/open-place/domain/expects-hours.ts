const KINDS_WITH_HOURS: ReadonlySet<string | undefined> = new Set([
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
  'museum',
  'cinema',
  'library',
  'post-office',
  'theatre',
  'department-store'
]);

const expectsHours = (kind: string | undefined): boolean => KINDS_WITH_HOURS.has(kind);

export { expectsHours };
