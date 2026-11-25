import type { FakeLine, FakeStation } from '../../fake-station';
import DIRECTIONS_FILE from './line-directions/fr.json' with { type: 'json' };
import LINES_FILE from './lines.json' with { type: 'json' };
import STATIONS_FILE from './stations.json' with { type: 'json' };

type StationEntry = {
  readonly lines: readonly string[];
  readonly exits: FakeStation['exits'];
  readonly skippedDirections: readonly string[];
};

const ENTRIES: Readonly<Record<string, StationEntry>> = STATIONS_FILE;

const DIRECTIONS: readonly (readonly [string, readonly string[]])[] = Object.entries(DIRECTIONS_FILE);

const LINES: readonly Omit<FakeLine, 'directions'>[] = LINES_FILE;

const servedBy =
  (skipped: readonly string[]) =>
  (id: string): readonly FakeLine[] =>
    LINES.filter((line) => line.id === id).flatMap(({ tags }) =>
      DIRECTIONS.filter(([lineId]) => lineId === id).map(([, directions]) => ({
        id,
        tags,
        directions: directions.filter((direction) => !skipped.includes(direction))
      }))
    );

const stationOf = ([id, { lines, exits, skippedDirections }]: readonly [string, StationEntry]): FakeStation => ({
  id,
  lines: lines.flatMap(servedBy(skippedDirections)),
  exits
});

const stations = (): readonly FakeStation[] => Object.entries(ENTRIES).map(stationOf);

export { stations };
