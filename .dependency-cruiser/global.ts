import type { IForbiddenRuleType } from 'dependency-cruiser';
import { BROWSER_TESTS_TO_MIGRATE } from '#dependency-cruiser/browser-tests-to-migrate';
import { BUILD_TIME_CODE, BUILD_TIME_DEPENDENCIES, TESTS } from '#dependency-cruiser/shared';

export const FORBIDDEN_GLOBAL: IForbiddenRuleType[] = [
  {
    name: 'no-browser-in-unit-tests',
    severity: 'error',
    comment:
      'Unit tests run in Node: a real browser belongs to the Playwright end-to-end tests only. Use a DOM emulated by Vitest instead of its browser mode (#32).',
    from: { path: '^(?:src/|vite[.]config[.]ts$)', pathNot: BROWSER_TESTS_TO_MIGRATE },
    to: {
      path: [
        'node_modules/vitest/browser/',
        'node_modules/vitest-browser-[^/]+/',
        'node_modules/@vitest/browser[^/]*/',
        'node_modules/playwright(?:-core)?/',
        'node_modules/@playwright/'
      ]
    }
  },
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
    to: { couldNotResolve: true, pathNot: ['^[$]app/', '/[$]types$'] }
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
    from: { path: '^src/', pathNot: [TESTS, ...BUILD_TIME_CODE] },
    to: { dependencyTypes: ['npm-dev'], dependencyTypesNot: ['type-only'], pathNot: ['node_modules/@types/'] }
  },
  ...BUILD_TIME_DEPENDENCIES.map(
    ({ name, from, allowed }): IForbiddenRuleType => ({
      name,
      severity: 'error',
      comment: `This code only runs at build time, and may use these development dependencies only: ${allowed.join(', ')}.`,
      from: { path: from, pathNot: TESTS },
      to: {
        dependencyTypes: ['npm-dev'],
        dependencyTypesNot: ['type-only'],
        pathNot: ['node_modules/@types/', ...allowed.map((dependency) => `node_modules/${dependency}/`)]
      }
    })
  )
];
