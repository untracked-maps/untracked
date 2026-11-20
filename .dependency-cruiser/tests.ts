import type { IForbiddenRuleType } from 'dependency-cruiser';
import { TESTS } from '#dependency-cruiser/shared';

export const FORBIDDEN_TESTS: IForbiddenRuleType[] = [
  {
    name: 'tests-without-fake-data',
    severity: 'error',
    comment:
      'A test writes its own inputs, to show the case it tests: it never reads the fake places or Faker, which only their own library tests.',
    from: { path: TESTS, pathNot: '^src/libraries/fake-paris/' },
    to: { path: ['^src/libraries/fake-paris/', 'node_modules/@faker-js/'] }
  },
  {
    name: 'tests-read-only-their-own-json',
    severity: 'error',
    comment:
      'A test reads only the JSON files of its own folder, the data it tests, never a data set shared with other tests. The check of the translations reads them all.',
    from: { path: `^(.+)/[^/]+${TESTS}`, pathNot: '^src/libraries/i18n/messages[.]spec[.]ts$' },
    to: { path: '[.]json$', pathNot: '^$1/[^/]+[.]json$' }
  }
];
