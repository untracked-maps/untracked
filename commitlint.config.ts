import type { SyncRule, UserConfig } from '@commitlint/types';
import { RuleConfigSeverity } from '@commitlint/types';

const MAX_LINE_LENGTH = 72;

const CLAUDE_SESSION_LINK = /claude\.ai\/code\/session_/u;

const noClaudeSessionLink: SyncRule = ({ raw }) => [
  !CLAUDE_SESSION_LINK.test(raw ?? ''),
  'a commit message never links a Claude session: it is private to its author'
];

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  plugins: [{ rules: { 'no-claude-session-link': noClaudeSessionLink } }],
  rules: {
    'no-claude-session-link': [RuleConfigSeverity.Error, 'always'],
    'header-max-length': [RuleConfigSeverity.Error, 'always', MAX_LINE_LENGTH],
    'body-empty': [RuleConfigSeverity.Error, 'never'],
    'body-max-line-length': [RuleConfigSeverity.Error, 'always', MAX_LINE_LENGTH],
    'scope-enum': [RuleConfigSeverity.Error, 'always', ['deps', 'release']]
  }
};

export default config;
