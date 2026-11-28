import type { UserConfig } from '@commitlint/types';
import { RuleConfigSeverity } from '@commitlint/types';

const config: UserConfig = {
  extends: ['./commitlint.config.ts'],
  rules: {
    'body-empty': [RuleConfigSeverity.Disabled]
  }
};

export default config;
