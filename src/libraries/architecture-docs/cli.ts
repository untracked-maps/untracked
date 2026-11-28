import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import dependencyCruiserConfig from '../../../.dependency-cruiser';
import { type FoldersLintConfig, toFolders } from './folders';
import { renderPage } from './page';
import { toRules } from './rules';

const [outputDirectory = 'build/docs'] = process.argv.slice(2);

const foldersLint: FoldersLintConfig = JSON.parse(readFileSync('.folderslintrc', 'utf8'));

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(
  join(outputDirectory, 'index.html'),
  renderPage({
    rules: toRules(dependencyCruiserConfig.forbidden ?? []),
    folders: toFolders(foldersLint),
    links: [
      { href: 'features.html', label: 'Features and their scenarios' },
      { href: 'https://github.com/untracked-maps/untracked/tree/main/docs/decisions', label: 'Architecture decisions' }
    ]
  })
);
