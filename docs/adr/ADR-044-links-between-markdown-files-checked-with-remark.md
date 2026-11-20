# ADR-044 — Links between Markdown files checked with remark

**Date**: 2026-11-20
**Status**: accepted

## Context

A prek hook ran [lychee](https://github.com/lycheeverse/lychee) offline on every Markdown file, so that no link to a file or a heading of the repository breaks ([ADR-019](ADR-019-deterministic-checks-beyond-linting.md)). Its hook installs lychee through cargo-binstall, which asks GitHub's API for the release of `lycheeverse/lychee`. In Claude Code's cloud sessions, GitHub is reached through a proxy limited to the session's own repository: the request is refused, the fallback build stops, and no change to a Markdown file can be committed there. A weekly CI job also runs lychee online, through its official action, on every link, other sites included.

Both tools were run on the repository and on a file of deliberate mistakes:

|                                                        | lychee, offline           | remark-validate-links                          |
| ------------------------------------------------------ | ------------------------- | ---------------------------------------------- |
| Missing file, missing heading, here or in another file | found                     | found                                          |
| Link to a missing file of this repository on GitHub    | skipped offline           | found                                          |
| Heading given by an HTML `id`                          | understood                | not understood                                 |
| Installed from                                         | GitHub's API and releases | the npm registry, locked like every dependency |

## Decision

- **A local prek hook runs `pnpm lint:links`**: [remark-cli](https://github.com/remarkjs/remark/tree/main/packages/remark-cli) with [remark-validate-links](https://github.com/remarkjs/remark-validate-links), configured in `package.json`'s `remarkConfig`, on every Markdown file git does not ignore, at each commit and in CI's `Hygiene` job. The lychee hook goes.
- **The README's headings are Markdown headings**, whose anchors GitHub computes, rather than HTML headings with an `id`, which remark-validate-links does not read.
- **lychee keeps the weekly online check** of every link, other sites included, in CI, where nothing limits it.
- **`undici-types@6.21.0` is excluded from pnpm's trust policy** until `unified-engine` 11.3.0, published on 2026-11-19, passes the ten days of `minimumReleaseAge`: until then pnpm resolves 11.2.2, which asks for `@types/node` 22 and so for this version of `undici-types`, published in 2024 before the package adopted provenance. The owner chose the exclusion over waiting. Once a lockfile maintenance resolves `unified-engine` 11.3.0, the exclusion is removed.

## Consequences

- Every hook installs from a package registry; none needs GitHub's API.
- The README's anchors start with a hyphen, `#-about`, since its headings start with an emoji.
- remark-validate-links last released in February 2025; Renovate may list it as abandoned while it stays the reference of the remark ecosystem.

## Alternatives considered

- **lychee built from crates.io by a local `rust` hook**: no GitHub API, but a build of several minutes in each fresh cloud session, within the ten minutes of its start hook.
- **lychee's Docker image**: from an allowed registry, but Docker required on every machine.
- **lychee installed by hand in the cloud setup script**: the hand install the project refuses.
- **Waiting until 2026-11-29 instead of the exclusion**: no weakened policy, but cloud sessions unable to commit Markdown for nine days.
