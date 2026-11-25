# ADR-070 — The site built and deployed in two jobs

**Date**: 2026-11-25
**Status**: accepted

## Context

The `deploy` job of the Release workflow built the site, uploaded it with `actions/upload-pages-artifact`, then published it with `actions/deploy-pages`, in the same job ([ADR-013](ADR-013-releases-with-semantic-release-and-pages.md)).

On 2026-11-25, it failed twice, for #102 and #105, with the same error: `deploy-pages` listed the run's artifacts and found only the four Lighthouse reports, not `github-pages`, which the step before had uploaded and finalized half a second earlier. A re-run of the job published the site. The workflow had not changed since 2026-11-20, and the Release run of #101 had published the site that same morning. That the list of artifacts lags behind an upload this recent is an inference from the times in the logs, not a cause GitHub has confirmed.

oertio asked to follow the practice of the maintainer's cartographie application, `anct-cartographie-nationale/cartographie`. Its server is deployed to Scaleway with Pulumi, not to GitHub Pages, so its deployment itself does not carry over. Its release workflow, however, builds in one job, uploads the build as an artifact, and uses it in a second job that `needs` the first. GitHub's own starter workflow for Pages is split the same way.

## Decision

- **A `build` job** checks out the tag, builds the site and its documentation, uploads them with `actions/upload-pages-artifact`, and attaches the zip and the SBOM to the release.
- **A `deploy` job**, which `needs` it, only publishes the artifact with `actions/deploy-pages`, in the `github-pages` environment.

### Permissions

This replaces the `deploy` line of [ADR-013](ADR-013-releases-with-semantic-release-and-pages.md):

- `build` attaches the build to the release (`contents: write`) and reads the Pages settings to get the base path (`pages: read`);
- `deploy` publishes to Pages (`pages: write`) and proves its identity to Pages with an OIDC token (`id-token: write`). It checks out nothing.

## Consequences

- The artifact is listed by a job that starts after the one that uploaded it, rather than half a second later in the same job.
- The job that holds the Pages permissions runs no build tool and none of the repository's code.
- The release gets its zip and SBOM even if the publication fails.
- One more job runs at each release, for a few seconds.

## Alternatives considered

- **Waiting a few seconds before `deploy-pages`**: it bets on a delay that nobody publishes.
- **Re-running the job when it fails**: what was done by hand on 2026-11-25; making it automatic would hide a failure that has another cause.
- **Deploying like cartographie, to Scaleway with Pulumi**: another host, accounts and secrets for a static site that [ADR-013](ADR-013-releases-with-semantic-release-and-pages.md) publishes to GitHub Pages.
