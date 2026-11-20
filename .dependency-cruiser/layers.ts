import type { IForbiddenRuleType } from 'dependency-cruiser';
import { DOMAIN_PACKAGE_PATHS, TESTS } from '#dependency-cruiser/shared';

export const FORBIDDEN_LAYERS: IForbiddenRuleType[] = [
  {
    name: 'pure-feature-domain',
    severity: 'error',
    comment:
      'The feature domain depends only on itself and on the packages of DOMAIN_PACKAGES: rxjs and the libraries that implement a standard.',
    from: { path: '^src/features/([^/]+)/domain/', pathNot: TESTS },
    to: { pathNot: ['^src/features/$1/domain/', ...DOMAIN_PACKAGE_PATHS] }
  },
  {
    name: 'pure-ability-domain',
    severity: 'error',
    comment:
      'The ability domain depends only on itself, on the feature domain and on the packages of DOMAIN_PACKAGES: rxjs and the libraries that implement a standard.',
    from: { path: '^src/features/([^/]+)/abilities/([^/]+)/domain/', pathNot: TESTS },
    to: {
      pathNot: ['^src/features/$1/abilities/$2/domain/', '^src/features/$1/domain/', ...DOMAIN_PACKAGE_PATHS]
    }
  },
  {
    name: 'feature-implementation-dependencies',
    severity: 'error',
    comment: 'A feature adapter implements a port of the feature domain, with libraries and npm packages.',
    from: { path: '^src/features/([^/]+)/implementation/', pathNot: TESTS },
    to: { pathNot: ['^src/features/$1/implementation/', '^src/features/$1/domain/', '^src/libraries/', 'node_modules/'] }
  },
  {
    name: 'ability-implementation-dependencies',
    severity: 'error',
    comment:
      'An ability adapter implements a port of its domain, with the feature domain and adapters, libraries and npm packages.',
    from: { path: '^src/features/([^/]+)/abilities/([^/]+)/implementation/', pathNot: TESTS },
    to: {
      pathNot: [
        '^src/features/$1/abilities/$2/implementation/',
        '^src/features/$1/abilities/$2/domain/',
        '^src/features/$1/implementation/',
        '^src/features/$1/domain/',
        '^src/libraries/',
        'node_modules/'
      ]
    }
  },
  {
    name: 'feature-ui-dependencies',
    severity: 'error',
    comment:
      'Feature UI renders the feature domain, with libraries, translations and npm packages. It never reaches an adapter.',
    from: { path: '^src/features/([^/]+)/ui/', pathNot: TESTS },
    to: {
      pathNot: ['^src/features/$1/ui/', '^src/features/$1/domain/', '^src/libraries/', '^[.]paraglide/', 'node_modules/']
    }
  },
  {
    name: 'ability-ui-dependencies',
    severity: 'error',
    comment:
      'Ability UI renders its domain and the feature domain and UI, with libraries, translations and npm packages. It never reaches an adapter.',
    from: { path: '^src/features/([^/]+)/abilities/([^/]+)/ui/', pathNot: TESTS },
    to: {
      pathNot: [
        '^src/features/$1/abilities/$2/ui/',
        '^src/features/$1/abilities/$2/domain/',
        '^src/features/$1/ui/',
        '^src/features/$1/domain/',
        '^src/libraries/',
        '^[.]paraglide/',
        'node_modules/'
      ]
    }
  }
];
