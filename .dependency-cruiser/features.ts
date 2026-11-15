import type { IForbiddenRuleType } from 'dependency-cruiser';

export const FORBIDDEN_FEATURES: IForbiddenRuleType[] = [
  {
    name: 'no-dependencies-between-features',
    severity: 'error',
    comment: 'A feature never depends on another feature, not even on its index.ts. Composition happens in routes.',
    from: { path: '^src/features/([^/]+)/' },
    to: { path: '^src/features/', pathNot: '^src/features/$1/' }
  },
  {
    name: 'no-routes-or-configuration-in-features',
    severity: 'error',
    comment: 'Features never depend on routes or configuration: routes inject what a feature needs.',
    from: { path: '^src/features/' },
    to: { path: ['^src/routes/', '^src/configuration/'] }
  },
  {
    name: 'no-dependencies-between-abilities',
    severity: 'error',
    comment:
      'An ability never depends on another ability. Code shared by abilities moves up to the feature, under the same folder name.',
    from: { path: '^src/features/([^/]+)/abilities/([^/]+)/' },
    to: { path: '^src/features/$1/abilities/', pathNot: '^src/features/$1/abilities/$2/' }
  },
  {
    name: 'no-abilities-in-feature-root',
    severity: 'error',
    comment: 'The feature root never depends on its abilities: abilities build on the feature, not the other way round.',
    from: { path: '^src/features/([^/]+)/', pathNot: '^src/features/[^/]+/abilities/' },
    to: { path: '^src/features/$1/abilities/' }
  }
];
