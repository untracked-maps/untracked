import { readdirSync, readFileSync } from 'node:fs';
import type { SizeLimitConfig } from 'size-limit';

const CHUNKS = 'build/_app/immutable/chunks';

const MAPLIBRE_MARKER = 'maplibregl-canvas';

const OPENING_HOURS_MARKER = 'opening-hours/opening_hours.js';

const chunksHolding = (marker: string): readonly string[] => {
  const paths = readdirSync(CHUNKS)
    .map((file) => `${CHUNKS}/${file}`)
    .filter((path) => readFileSync(path, 'utf8').includes(marker));
  if (paths.length === 0) {
    throw new Error(`No chunk of ${CHUNKS} holds ${marker}: build first, or find the library's new marker`);
  }
  return paths;
};

const mapLibreChunks: readonly string[] = chunksHolding(MAPLIBRE_MARKER);

const openingHoursChunks: readonly string[] = chunksHolding(OPENING_HOURS_MARKER);

const config: SizeLimitConfig = [
  { name: 'MapLibre', path: [...mapLibreChunks], limit: '300 kB', gzip: true },
  { name: 'The opening-hours library', path: [...openingHoursChunks], limit: '120 kB', gzip: true },
  {
    name: 'The rest of the app',
    path: [
      'build/_app/immutable/**/*.js',
      '!build/_app/immutable/workers/**',
      ...[...mapLibreChunks, ...openingHoursChunks].map((path) => `!${path}`)
    ],
    limit: '200 kB',
    gzip: true
  },
  { name: 'The places file', path: ['build/data/places.json'], limit: '90 kB', gzip: true },
  { name: 'The details of the places', path: ['build/data/place-details.json'], limit: '70 kB', gzip: true }
];

export default config;
