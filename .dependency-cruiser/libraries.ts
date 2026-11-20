import type { IForbiddenRuleType } from 'dependency-cruiser';
import { LIBRARY_DEPENDENCIES, TESTS } from '#dependency-cruiser/shared';

export const FORBIDDEN_LIBRARIES: IForbiddenRuleType[] = [
  {
    name: 'libraries-are-standalone',
    severity: 'error',
    comment: 'Libraries never depend on routes, configuration or features.',
    from: { path: '^src/libraries/' },
    to: { path: ['^src/routes/', '^src/configuration/', '^src/features/'] }
  },
  ...Object.entries(LIBRARY_DEPENDENCIES).map(
    ([library, allowed]): IForbiddenRuleType => ({
      name: `library-${library}-allowed-dependencies`,
      severity: 'error',
      comment: `Library ${library} may only depend on: ${allowed.join(', ') || 'nothing'}.`,
      from: { path: `^src/libraries/${library}/` },
      to: {
        path: '^src/libraries/',
        pathNot: [`^src/libraries/${library}/`, ...allowed.map((dependency) => `^src/libraries/${dependency}/`)]
      }
    })
  ),
  {
    name: 'no-undeclared-library-dependencies',
    severity: 'error',
    comment: 'A library not listed in LIBRARY_DEPENDENCIES depends on no other library.',
    from: {
      path: '^src/libraries/([^/]+)/',
      pathNot: Object.keys(LIBRARY_DEPENDENCIES).map((library) => `^src/libraries/${library}/`)
    },
    to: { path: '^src/libraries/', pathNot: '^src/libraries/$1/' }
  },
  {
    name: 'fake-places-generator-knows-no-zone',
    severity: 'error',
    comment:
      'The fake places generator receives its zone from the configuration: it never reaches a zone itself, so that no zone is a default.',
    from: { path: '^src/libraries/fake-places/', pathNot: ['^src/libraries/fake-places/zones/', TESTS] },
    to: { path: '^src/libraries/fake-places/zones/' }
  }
];
