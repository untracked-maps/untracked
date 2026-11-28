import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import type { SizeLimitConfig } from 'size-limit';
import type { Manifest } from 'vite';
import { onDemandChunks, startUpChunks } from '#libraries/chunk-loading/chunk-loading';

const BUILD = 'build';

const CHUNKS = `${BUILD}/_app/immutable/chunks`;

const VITE_MANIFEST = '.svelte-kit/output/client/.vite/manifest.json';

const MAPLIBRE_MARKER = 'maplibregl-canvas';

const OPENING_HOURS_MARKER = 'opening-hours/opening_hours.js';

type Measured = { readonly path: string; readonly size: number };

const chunksHolding = (marker: string): readonly string[] => {
  const paths = readdirSync(CHUNKS)
    .map((file) => `${CHUNKS}/${file}`)
    .filter((path) => readFileSync(path, 'utf8').includes(marker));
  if (paths.length === 0) {
    throw new Error(`No chunk of ${CHUNKS} holds ${marker}: build first, or find the library's new marker`);
  }
  return paths;
};

const filesUnder = (folder: string): readonly string[] =>
  readdirSync(folder, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => `${entry.parentPath}/${entry.name}`);

const measured = (path: string): Measured => ({ path, size: gzipSync(readFileSync(path)).length });

const heavier = (one: Measured, other: Measured): Measured => (other.size > one.size ? other : one);

const heaviestFileUnder = (folder: string): string => {
  const [first, ...others] = filesUnder(folder).map(measured);
  if (first === undefined) {
    throw new Error(`No file under ${folder}: build first`);
  }
  return others.reduce(heavier, first).path;
};

const manifest: Manifest = JSON.parse(readFileSync(VITE_MANIFEST, 'utf8'));

const inBuild = (file: string): string => `${BUILD}/${file}`;

const mapLibreChunks: readonly string[] = chunksHolding(MAPLIBRE_MARKER);

const openingHoursChunks: readonly string[] = chunksHolding(OPENING_HOURS_MARKER);

const libraryChunks: readonly string[] = [...mapLibreChunks, ...openingHoursChunks];

const appChunks = (files: readonly string[]): string[] => files.map(inBuild).filter((path) => !libraryChunks.includes(path));

const config: SizeLimitConfig = [
  { name: 'MapLibre, at start-up', path: [...mapLibreChunks], limit: '289 kB', gzip: true },
  { name: 'The opening-hours library, preloaded at start-up', path: [...openingHoursChunks], limit: '115 kB', gzip: true },
  { name: 'The rest of the code at start-up', path: appChunks(startUpChunks(manifest)), limit: '136 kB', gzip: true },
  { name: 'The code loaded on demand', path: appChunks(onDemandChunks(manifest)), limit: '61 kB', gzip: true },
  { name: 'The places file', path: [`${BUILD}/data/places.json`], limit: '72 kB', gzip: true },
  { name: 'The details of the places', path: [`${BUILD}/data/place-details.json`], limit: '56 kB', gzip: true },
  { name: 'The addresses', path: [`${BUILD}/data/addresses.json`], limit: '37 kB', gzip: true },
  { name: 'The districts', path: [`${BUILD}/data/districts.json`], limit: '2 kB', gzip: true },
  { name: 'The heaviest station', path: [heaviestFileUnder(`${BUILD}/data/stations`)], limit: '1 kB', gzip: true },
  { name: 'The heaviest street view', path: [heaviestFileUnder(`${BUILD}/data/panoramax`)], limit: '1 kB', gzip: true },
  { name: 'The heaviest glyph range', path: [heaviestFileUnder(`${BUILD}/glyphs`)], limit: '74 kB', gzip: true },
  { name: 'The heaviest sprite file', path: [heaviestFileUnder(`${BUILD}/sprites`)], limit: '15 kB', gzip: true }
];

export default config;
