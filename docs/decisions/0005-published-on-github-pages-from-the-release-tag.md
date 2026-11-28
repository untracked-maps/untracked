---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# Published on GitHub Pages from the release tag, by jobs with the least privilege

## Context and Problem Statement

The site is a folder of static files ([0004](0004-a-sveltekit-site-prerendered-as-static-files.md)), and the continuous integration only builds, tests, releases and publishes it ([0002](0002-a-static-client-app-reading-map-data-from-outside-behind-ports.md)). The previous repository published its site by pushing every build to a branch, which added a copy of the site to the history at each publication.

A release writes to the repository, attaches files to a release and publishes to the host: three powers that a compromised step could abuse. When the same job built the site and published it, the publication twice failed to find the artifact the step before had just uploaded, and a re-run published it.

Where is the site hosted, what is published, and which job holds which permission?

## Decision Drivers

- Nothing built is committed: the history of the repository never grows with the site.
- What is published is exactly what a release tag designates.
- Each job holds only the permissions its own steps need, and the job that publishes runs no code of the repository.
- No host, account or secret beyond the forge for a static site.

## Considered Options

- GitHub Pages, deployed as an artifact built from the release tag, by a build job and a deploy job with their own permissions
- A branch of the built site, pushed by a script
- Another host: a static pages host elsewhere, an object store, or a server deployed with infrastructure as code
- GitHub Pages, built and deployed in one job

## Decision Outcome

Chosen option: « GitHub Pages, deployed as an artifact built from the release tag, by a build job and a deploy job with their own permissions », because Pages serves static files for free and takes an artifact rather than a branch, and splitting the jobs gives the power to publish to a job that runs nothing of the repository.

### A release on every push to the main branch

Every push to the main branch runs the checks, then semantic-release, which derives the version from the Conventional Commits merged since the last release, writes the changelog and the version, tags the commit and creates the release. A push without a change that calls for a version releases and publishes nothing.

### Built from the tag, published as an artifact

A build job checks out the tag, builds the site with the base path the host gives, uploads it as the Pages artifact, and attaches the archive of the site and its bill of materials to the release. A deploy job, which needs it, only publishes that artifact. There is no branch of the built site.

### Each job asks only for what it needs

Every workflow starts from reading the contents of the repository, and a job asks for more only for its own steps:

- the release job reads with the workflow's token, and writes the release commit, the tag, and its comments on the issues and pull requests a release closes, with the token of a GitHub App installed on this repository only, limited to those permissions;
- the build job writes to the release, to attach its files, and reads the settings of Pages, to get the base path;
- the deploy job writes to Pages and proves its identity to Pages with an OIDC token, and checks out nothing.

The reasons for these permissions live here, since the workflows carry no comments.

### Consequences

- Good, because the history of the repository never holds a built site.
- Good, because the job that can publish runs no build tool and none of the repository's code.
- Good, because the release gets its archive and its bill of materials even if the publication fails.
- Good, because the artifact is listed by a job that starts after the one that uploaded it.
- Bad, because the site depends on one forge for its code, its continuous integration and its hosting.
- Neutral, because the audit of the workflows that asks for a comment on each permission is turned off: this record holds those reasons.

### Confirmation

zizmor audits the workflows on each commit and in CI. The release workflow is the only one that deploys.

## Pros and Cons of the Options

### A branch of the built site, pushed by a script

What the previous repository did: every publication added a copy of the site to the history, which grew far heavier than the code.

### Another host: a static pages host elsewhere, an object store, or a server deployed with infrastructure as code

Possible later. Each needs an account, secrets and a deployment of its own, for a static site that the forge serves already, from the same workflow as the release.

### GitHub Pages, built and deployed in one job

What the first releases did. The job that held the power to publish also ran the build and its dependencies, and the publication could start before the artifact uploaded by the step before was listed. Waiting a few seconds bets on a delay nobody publishes, and re-running on failure would hide a failure with another cause.

## More Information

### Where to find the detail

- [The release workflow](../../.github/workflows/release.yml)
- [The configuration of semantic-release](../../release.config.ts)
- [The audit of the workflows](../../.github/zizmor.yml)

### References

- [Publishing with a custom GitHub Actions workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [semantic-release](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Permissions of the workflow token](https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)

### History

- 2026-11-28, marc-gavanier: first writing.
