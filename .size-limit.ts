import { readdirSync, readFileSync } from 'node:fs';
import type { SizeLimitConfig } from 'size-limit';

const CHUNKS = 'build/_app/immutable/chunks';

const MAPLIBRE_MARKER = 'maplibregl-canvas';

const chunksHolding = (marker: string): readonly string[] =>
  readdirSync(CHUNKS)
    .map((file) => `${CHUNKS}/${file}`)
    .filter((path) => readFileSync(path, 'utf8').includes(marker));

const found = (paths: readonly string[]): readonly string[] => {
  if (paths.length === 0) {
    throw new Error(`No chunk of ${CHUNKS} holds ${MAPLIBRE_MARKER}: build first, or find MapLibre's new marker`);
  }
  return paths;
};

const mapLibreChunks: readonly string[] = found(chunksHolding(MAPLIBRE_MARKER));

const config: SizeLimitConfig = [
  { name: 'MapLibre', path: [...mapLibreChunks], limit: '300 kB', gzip: true },
  {
    name: 'The rest of the app',
    path: ['build/_app/immutable/**/*.js', '!build/_app/immutable/workers/**', ...mapLibreChunks.map((path) => `!${path}`)],
    limit: '200 kB',
    gzip: true
  },
  { name: 'The places file', path: ['build/data/places.json'], limit: '120 kB', gzip: true }
];

export default config;
