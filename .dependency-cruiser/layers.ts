import type { IForbiddenRuleType } from 'dependency-cruiser';
import { TESTS } from '#dependency-cruiser/shared';

export const FORBIDDEN_LAYERS: IForbiddenRuleType[] = [
  {
    name: 'pure-feature-domain',
    severity: 'error',
    comment: 'The feature domain is pure TypeScript: it depends only on itself and on rxjs.',
    from: { path: '^src/features/([^/]+)/domain/', pathNot: TESTS },
    to: { pathNot: ['^src/features/$1/domain/', 'node_modules/rxjs/'] }
  },
  {
    name: 'pure-ability-domain',
    severity: 'error',
    comment: 'The ability domain is pure TypeScript: it depends only on itself, on the feature domain and on rxjs.',
    from: { path: '^src/features/([^/]+)/abilities/([^/]+)/domain/', pathNot: TESTS },
    to: { pathNot: ['^src/features/$1/abilities/$2/domain/', '^src/features/$1/domain/', 'node_modules/rxjs/'] }
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
