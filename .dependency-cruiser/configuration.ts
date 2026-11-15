import type { IForbiddenRuleType } from 'dependency-cruiser';

export const FORBIDDEN_CONFIGURATION: IForbiddenRuleType[] = [
  {
    name: 'configuration-dependencies',
    severity: 'error',
    comment: 'Configuration holds application settings. It depends only on itself, libraries and npm packages.',
    from: { path: '^src/configuration/' },
    to: { pathNot: ['^src/configuration/', '^src/libraries/', 'node_modules/'] }
  }
];
