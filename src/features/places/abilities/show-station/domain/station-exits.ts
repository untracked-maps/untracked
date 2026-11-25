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

type NumberedExit = StationExit & { readonly ref: string };

const isNumbered = (exit: StationExit): exit is NumberedExit => exit.ref !== undefined;

const byNumber = (one: NumberedExit, other: NumberedExit): number => REFS.compare(one.ref, other.ref);

const stationExits = (exits: readonly Exit[]): readonly StationExit[] => {
  const all = exits.map(exitOf);
  return [...all.filter(isNumbered).toSorted(byNumber), ...all.filter((exit) => !isNumbered(exit))];
};

export { type Coordinates, type Exit, type StationExit, stationExits };
