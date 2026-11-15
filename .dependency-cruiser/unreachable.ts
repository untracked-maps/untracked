import type { IForbiddenRuleType } from 'dependency-cruiser';
import { ENTRY_POINTS, TESTS } from '#dependency-cruiser/shared';

export const FORBIDDEN_UNREACHABLE: IForbiddenRuleType[] = [
  {
    name: 'no-unreachable-from-entry-points',
    severity: 'error',
    comment:
      'Every module is reachable from a route, a hook, a configuration file or a command line tool. ' +
      'A module only its own test uses is dead code: use it or remove it.',
    from: { path: ENTRY_POINTS },
    to: { path: '^src/', pathNot: [...ENTRY_POINTS, TESTS, '[.]d[.]ts$', '^src/app[.]html$'], reachable: false }
  }
];
