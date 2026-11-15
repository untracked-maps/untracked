# ADR-003 — GitHub Actions build, test and publish only; GitHub Pages hosts the site

**Date**: 2026-11-15
**Status**: accepted

## Context

GitHub suspended the previous organisation for its use of GitHub Actions: nightly data builds, shop website scraping and a France-wide routing test that hit the 6-hour job limit. GitHub's terms reserve Actions for building, testing, deploying and publishing the software of the repository.

The app is a static site, which GitHub Pages serves for free. The [SvelteKit documentation](https://svelte.dev/docs/kit/adapter-static) describes deploying it with the official Pages actions, `actions/configure-pages`, `actions/upload-pages-artifact` and `actions/deploy-pages`.

## Decision

- GitHub Actions only build, test, release and publish the app. No workflow fetches, transforms or stores data for the map.
- The site is published to GitHub Pages as a build artifact, from the release tag ([ADR-013](ADR-013-releases-with-semantic-release-and-pages.md)). There is no `gh-pages` branch and no build output in git.
- The scheduled workflows test or scan the software: mutation testing, security analysis and Scorecard, each weekly.

## Consequences

- The repository never grows with published data.
- A workflow that is not a build, a test, a release or a deployment is refused in review.

## Alternatives considered

- **A `gh-pages` branch pushed by a script.** The previous repository did this; every publication added a copy of the site to git history.
- **Another host (Codeberg Pages, an object store).** Possible later; GitHub Pages needs no account elsewhere and fits the release workflow.
