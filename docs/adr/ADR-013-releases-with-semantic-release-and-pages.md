# ADR-013 — Releases with semantic-release, published to GitHub Pages

**Date**: 2026-11-15
**Status**: accepted

## Decision

Every push to `main` runs the checks, then semantic-release:

1. It derives the version from Conventional Commits: `fix` for a patch, `feat` for a minor, a breaking change for a major.
2. It updates `package.json`, `CHANGELOG.md` and the `Current version` line of the README, commits them as `chore(release): x.y.z [skip ci]`, tags `vx.y.z` and creates the GitHub release.
3. A second job checks out the tag, builds the site, publishes it with `actions/deploy-pages`, and attaches the build as a zip to the release.

A push without a `feat` or `fix` commit releases and publishes nothing.

### Permissions

Every workflow starts from `contents: read`, and a job asks only for what it needs:

- `release` writes the release commit and tag (`contents: write`) and comments on the issues and pull requests a release closes (`issues: write`, `pull-requests: write`);
- `deploy` attaches the build to the release (`contents: write`), publishes to Pages (`pages: write`) and proves its identity to Pages with an OIDC token (`id-token: write`).

- `codeql` and `all-dependencies` in the security workflow upload their findings to code scanning (`security-events: write`);
- `scorecard` reads the workflows' runs (`actions: read`), uploads its findings (`security-events: write`) and publishes its score with an OIDC token (`id-token: write`).

These reasons live here rather than in the workflows, which carry no comments; zizmor's `undocumented-permissions` audit, which asks for such comments, is turned off.

## Consequences

- The release commit is pushed to `main` with the workflow token. If `main` is protected, the release needs a bypass for that token or a GitHub App.

## Alternatives considered

- **Tags without a release commit**: the README could not show the version.
