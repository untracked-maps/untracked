import type { Tags } from './good-to-know';

type PreciseType =
  | 'cathedral'
  | 'basilica'
  | 'chapel'
  | 'church'
  | 'monument'
  | 'palace'
  | 'tower'
  | 'museum'
  | 'cultural-centre'
  | 'theatre'
  | 'library'
  | 'garden'
  | 'park';

type Tag = readonly [key: string, value: string];

type Rule = readonly [type: PreciseType, ...tags: readonly Tag[]];

const WORSHIP: Tag = ['amenity', 'place_of_worship'];

const RULES: readonly Rule[] = [
  ['cathedral', WORSHIP, ['building', 'cathedral']],
  ['basilica', WORSHIP, ['building', 'basilica']],
  ['chapel', WORSHIP, ['building', 'chapel']],
  ['church', WORSHIP, ['building', 'church']],
  ['monument', ['historic', 'monument']],
  ['palace', ['historic', 'castle'], ['castle_type', 'palace']],
  ['tower', ['man_made', 'tower']],
  ['museum', ['tourism', 'museum']],
  ['cultural-centre', ['amenity', 'arts_centre']],
  ['theatre', ['amenity', 'theatre']],
  ['library', ['amenity', 'library']],
  ['garden', ['leisure', 'garden']],
  ['park', ['leisure', 'park']]
];

const preciseTypeOf = (tags: Tags = {}): PreciseType | undefined =>
  RULES.find(([, ...wanted]) => wanted.every(([key, value]) => tags[key] === value))?.[0];

export { type PreciseType, preciseTypeOf };
