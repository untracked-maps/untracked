import type { IForbiddenRuleType } from 'dependency-cruiser';
import { TESTS } from '#dependency-cruiser/shared';

export const FORBIDDEN_GLOBAL: IForbiddenRuleType[] = [
  {
    name: 'no-circular',
    severity: 'error',
    comment:
      'This dependency is part of a circular relationship. Break the cycle with dependency inversion or by splitting responsibilities.',
    from: {},
    to: { circular: true }
  },
  {
    name: 'no-orphans',
    severity: 'error',
    comment: 'This module is not used. Use it or remove it.',
    from: {
      orphan: true,
      pathNot: [
        '[.]d[.]ts$',
        '^src/(?:app[.]html|hooks(?:[.]server)?[.]ts)$',
        '^src/routes/',
        '^src/libraries/[^/]+/cli[.]ts$',
        TESTS
      ]
    },
    to: {}
  },
  {
    name: 'not-to-deprecated',
    severity: 'error',
    comment: 'This module uses a deprecated npm package. Upgrade it or find an alternative.',
    from: {},
    to: { dependencyTypes: ['deprecated'] }
  },
  {
    name: 'no-non-package-json',
    severity: 'error',
    comment: 'This module depends on an npm package that is not declared in package.json.',
    from: {},
    to: { dependencyTypes: ['npm-no-pkg', 'npm-unknown'] }
  },
  {
    name: 'not-to-unresolvable',
    severity: 'error',
    comment: 'This module depends on a module that cannot be resolved.',
    from: {},
    to: { couldNotResolve: true, pathNot: '^[$]app/' }
  },
  {
    name: 'no-duplicate-dep-types',
    severity: 'error',
    comment:
      'This npm package is declared more than once in package.json, for example both as a dependency and a devDependency.',
    from: {},
    to: { moreThanOneDependencyType: true, dependencyTypesNot: ['type-only'] }
  },
  {
    name: 'not-to-test',
    severity: 'error',
    comment: 'Production code never depends on a test file. Move what is shared into the code under test.',
    from: {},
    to: { path: TESTS }
  },
  {
    name: 'not-to-dev-dep',
    severity: 'error',
    comment: 'Code shipped to the browser depends on a devDependency. Declare the package in dependencies.',
    from: { path: '^src/', pathNot: TESTS },
    to: { dependencyTypes: ['npm-dev'], dependencyTypesNot: ['type-only'], pathNot: ['node_modules/@types/'] }
  }
];
