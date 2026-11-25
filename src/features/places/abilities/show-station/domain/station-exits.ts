import type { Tags } from './next-departures';

type Coordinates = {
  readonly longitude: number;
  readonly latitude: number;
};

type Exit = {
  readonly coordinates: Coordinates;
  readonly tags: Tags;
};

type Access = 'accessible' | 'escalator';

type StationExit = {
  readonly ref?: string;
  readonly name?: string;
  readonly access?: Access;
  readonly coordinates: Coordinates;
};

const REFS = new Intl.Collator('en', { numeric: true });

const accessOf = (tags: Tags): Pick<StationExit, 'access'> => {
  if (tags['wheelchair'] === 'yes') {
    return { access: 'accessible' };
  }
  return tags['conveying'] === 'yes' ? { access: 'escalator' } : {};
};

const textOf = (tags: Tags, key: 'ref' | 'name'): Partial<Record<typeof key, string>> => {
  const value = tags[key];
  return value === undefined ? {} : { [key]: value };
};

const exitOf = ({ coordinates, tags }: Exit): StationExit => ({
  ...textOf(tags, 'ref'),
  ...textOf(tags, 'name'),
  ...accessOf(tags),
  coordinates
});

const byNumber = (one: StationExit, other: StationExit): number => {
  if (one.ref === undefined || other.ref === undefined) {
    return Number(one.ref === undefined) - Number(other.ref === undefined);
  }
  return REFS.compare(one.ref, other.ref);
};

const stationExits = (exits: readonly Exit[]): readonly StationExit[] => exits.map(exitOf).toSorted(byNumber);

export { type Coordinates, type Exit, type StationExit, stationExits };
