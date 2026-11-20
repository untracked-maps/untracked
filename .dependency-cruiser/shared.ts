export const TESTS = '[.](?:spec|steps|e2e)[.]ts$';

export const ENTRY_POINTS: string[] = [
  '^src/routes/',
  '^src/hooks(?:[.]server)?[.]ts$',
  '^src/libraries/[^/]+/cli[.]ts$',
  '^[^/]+[.]config[.]ts$'
];

export const DOMAIN_PACKAGES: readonly string[] = ['rxjs'];

export const DOMAIN_PACKAGE_PATHS: readonly string[] = DOMAIN_PACKAGES.map((name) => `node_modules/${name}/`);

export const LIBRARY_DEPENDENCIES: Readonly<Record<string, readonly string[]>> = {};

export const BUILD_TIME_DEPENDENCIES: readonly {
  readonly name: string;
  readonly from: string;
  readonly allowed: readonly string[];
}[] = [
  {
    name: 'in-memory-adapters-dependencies',
    from: '^src/features/.+/implementation/in-memory/',
    allowed: ['@faker-js/faker']
  },
  {
    name: 'fake-paris-dependencies',
    from: '^src/libraries/fake-paris/',
    allowed: ['@faker-js/faker']
  },
  {
    name: 'map-glyphs-dependencies',
    from: '^src/libraries/map-glyphs/',
    allowed: ['fontnik', 'woff2-encoder', 'inter-ui']
  },
  {
    name: 'map-sprite-dependencies',
    from: '^src/libraries/map-sprite/',
    allowed: ['@basemaps/sprites']
  },
  {
    name: 'prerendered-endpoints-dependencies',
    from: '^src/routes/.+/[+]server[.]ts$',
    allowed: ['@sveltejs/kit']
  }
];

export const BUILD_TIME_CODE: readonly string[] = BUILD_TIME_DEPENDENCIES.map(({ from }) => from);
