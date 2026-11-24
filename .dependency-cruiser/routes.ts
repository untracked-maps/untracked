import type { IForbiddenRuleType } from 'dependency-cruiser';

export const FORBIDDEN_ROUTES: IForbiddenRuleType[] = [
  {
    name: 'routes-compose-features',
    severity: 'error',
    comment:
      'Routes are the only place where features are composed: they import the modules they need from features, ' +
      'configuration, libraries and translations, and the modules of their own folder whose name does not start ' +
      'with +, never a file of another route.',
    from: { path: '^(src/routes.*)/[^/]+$' },
    to: {
      pathNot: [
        '^src/features/',
        '^src/configuration/',
        '^src/libraries/',
        '^$1/[^+/][^/]*$',
        '^[.]paraglide/',
        '^[.]svelte-kit/',
        '^[$]app/',
        '/[$]types$',
        'node_modules/'
      ]
    }
  }
];
