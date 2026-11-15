import type { IForbiddenRuleType } from 'dependency-cruiser';

export const FORBIDDEN_ROUTES: IForbiddenRuleType[] = [
  {
    name: 'routes-compose-features',
    severity: 'error',
    comment:
      'Routes are the only place where features are composed: they import the modules they need from features, ' +
      'configuration, libraries and translations, and never another route.',
    from: { path: '^src/routes/' },
    to: {
      pathNot: [
        '^src/features/',
        '^src/configuration/',
        '^src/libraries/',
        '^[.]paraglide/',
        '^[.]svelte-kit/',
        '^[$]app/',
        '/[$]types$',
        'node_modules/'
      ]
    }
  }
];
