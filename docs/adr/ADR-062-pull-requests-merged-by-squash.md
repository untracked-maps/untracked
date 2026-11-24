# ADR-062 — Pull requests merged by squash

**Date**: 2026-11-24
**Status**: accepted

## Context

The contributing guide said that pull requests were merged by fast-forward from a local clone, with `git push origin feat/something:main`. In practice, the pull requests of the rebuild are merged with GitHub's « Squash and merge » button, after an « Update with rebase » when `main` has moved on (#85). The repository's squash message is GitHub's default: the title, then the messages of the branch's commits; the description of a pull request does not reach `main`, and the trailer `Requested-by` was missing from seven squash commits because it was only in the description.

The maintainer merges the same way in `anct-cartographie-nationale/mednum-cli` and `anct-cartographie-nationale/lieux-de-mediation-numerique`: squash commits by GitHub, with the default message, the reasons written in the bodies of the branch's commits.

The product owner chose to align the guide on the practice on 2026-11-24, in the maintainer's absence.

## Decision

- **Pull requests are merged with « Squash and merge »**, once every required check is green and the branch is up to date with `main`.
- **The squash message stays GitHub's default.** What must reach `main`, a trailer included, is written in a commit of the branch, never only in the description of the pull request.
- **The rulesets do not change**: `main` keeps a linear history, its required checks and no required review.

## Consequences

- `main` gets one commit per pull request; the commits of a branch survive only as the body of that commit.
- A session or a contributor that puts a trailer only in the description loses it; the guide now says so.

## Alternatives considered

- **Keeping the fast-forward from a local clone**: keeps each commit of the branch on `main`, but nobody merges that way, and the guide would keep describing a practice that does not exist.
- **Setting the squash message to the pull request's title and description**: the trailer would reach `main` without anyone thinking of it, but the description, written for the reviewer, would replace the commits' reasons; and it is a setting of the repository, the maintainer's.
- **Requiring a review on `main`, or the maintainer's review on the files of rules through `CODEOWNERS`**: left to the maintainer, who requires a review in `lieux-de-mediation-numerique`, a package published on npm, but not here; every pull request would wait for the maintainer.
