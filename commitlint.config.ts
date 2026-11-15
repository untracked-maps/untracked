import type { UserConfig } from '@commitlint/types';
import { RuleConfigSeverity } from '@commitlint/types';

const MAX_LINE_LENGTH = 72;

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [RuleConfigSeverity.Error, 'always', MAX_LINE_LENGTH],
    'body-empty': [RuleConfigSeverity.Error, 'never'],
    'body-max-line-length': [RuleConfigSeverity.Error, 'always', MAX_LINE_LENGTH],
    'scope-enum': [RuleConfigSeverity.Error, 'always', ['deps', 'release']]
  }
};

export default config;
