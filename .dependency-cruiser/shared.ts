export const TESTS = '[.](?:spec|steps|e2e)[.]ts$';

export const ENTRY_POINTS: string[] = [
  '^src/routes/',
  '^src/hooks(?:[.]server)?[.]ts$',
  '^src/libraries/[^/]+/cli[.]ts$',
  '^[^/]+[.]config[.]ts$'
];

export const LIBRARY_DEPENDENCIES: Readonly<Record<string, readonly string[]>> = {};
