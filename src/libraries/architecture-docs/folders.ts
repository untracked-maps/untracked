type FoldersLintConfig = {
  readonly root?: string;
  readonly rules: readonly string[];
};

const TRAILING_WILDCARD = /\/\*\*$/u;

const withoutTrailingWildcard = (rule: string): string => rule.replace(TRAILING_WILDCARD, '');

const underRoot =
  (root: string | undefined) =>
  (folder: string): string =>
    root === undefined ? folder : `${root}/${folder}`;

const toFolders = ({ root, rules }: FoldersLintConfig): readonly string[] =>
  rules.map(withoutTrailingWildcard).map(underRoot(root));

export { type FoldersLintConfig, toFolders };
