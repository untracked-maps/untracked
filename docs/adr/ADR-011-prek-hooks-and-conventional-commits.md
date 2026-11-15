# ADR-011 — prek hooks and Conventional Commits

**Date**: 2026-11-15
**Status**: accepted

## Context

The same checks must run before each commit, before each push and in CI. husky with lint-staged runs JavaScript tools well, but the checks also include actionlint, zizmor, typos and gitleaks, which are not npm packages. prek, a Rust reimplementation of pre-commit already used in voice-bridge, runs all of them from one file, and is [published on npm](https://prek.j178.dev/installation/) as `@j178/prek`.

## Decision

- `.pre-commit-config.yaml` declares every check. `pnpm exec prek install` installs the hooks, once per clone. They are not installed on `pnpm install`: in CI they would run when semantic-release commits and pushes the release, where the browser the tests need is not installed, which is how the first release failed.
- On commit: file hygiene (merge markers, large files, final newline, trailing whitespace, LF line endings, YAML and JSON syntax, case conflicts, broken symlinks, private keys, shebangs, submodules), actionlint, zizmor, typos, gitleaks, Biome, svelte-check, dependency-cruiser and folderslint, knip.
- On push: the same, plus Vitest with its coverage thresholds, Cucumber and `pnpm audit`.
- On the commit message: commitlint with the conventional configuration, a header of at most 72 characters, a body that says why, wrapped at 72 characters, and no scope but `deps` for Renovate and `release` for semantic-release. Renovate's commits carry a body for that reason.
- Remote hooks are pinned by commit hash with a `# frozen: vX.Y.Z` annotation, updated with `prek update --freeze --cooldown-days 10`.
- CI runs `prek run --all-files`.

## Consequences

- Hooks are never bypassed with `--no-verify`.
- Commit messages drive versioning ([ADR-013](ADR-013-releases-with-semantic-release-and-pages.md)).

## Alternatives considered

- **husky and lint-staged**, as in la Cartographie nationale: gitleaks becomes a separate shell script and CI repeats each command.
