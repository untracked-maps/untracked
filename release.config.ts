import type { Options } from 'semantic-release';

const config: Options = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    ['@semantic-release/npm', { npmPublish: false }],
    ['@semantic-release/exec', { prepareCmd: "sed -i -E 's/^(Current version: ).*/\\1${nextRelease.version}/' README.md" }],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'CHANGELOG.md', 'README.md'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ],
    '@semantic-release/github'
  ]
};

export default config;
