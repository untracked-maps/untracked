# Contributing guide

Thank you for wanting to improve Untracked Maps. This guide explains how to get the project, run it locally and propose a change. Why the project is built the way it is lives in the [architecture decision records](docs/adr), and the rules the code and the tests follow in [`AGENTS.md`](AGENTS.md).

## Prerequisites

- [Node.js](https://nodejs.org) 24 or later.
- [pnpm](https://pnpm.io), at the version pinned in `package.json`.
- [Graphviz](https://graphviz.org), only to generate the architecture documentation.
- A system [Chrome](https://www.google.com/chrome/), only to run Lighthouse on Ubuntu, whose AppArmor profile refuses the sandbox of Playwright's Chromium.

## Get the project

```bash
git clone git@github.com:untracked-maps/untracked.git
cd untracked
pnpm install
pnpm exec prek install
pnpm exec playwright install chromium
```

The second command installs the git hooks that check each commit, each commit message and each push. pnpm refuses package versions published less than ten days ago.

## Run it

```bash
pnpm dev
```

serves the app with hot reload. To see what GitHub Pages serves, with the generated documentation under `/docs`:

```bash
pnpm build
pnpm docs:build
pnpm preview
```

## Commands

| Command                                                | What it does                                                                       |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `pnpm dev`                                             | Serves the app with hot reload                                                     |
| `pnpm build`                                           | Prerenders the site into `build/`                                                  |
| `pnpm docs:build`                                      | Generates the architecture documentation into `build/docs/`, after `pnpm build`    |
| `pnpm preview`                                         | Serves `build/`                                                                    |
| `pnpm check`                                           | Type-checks TypeScript and Svelte                                                  |
| `pnpm lint`                                            | Lints and checks formatting with Biome                                             |
| `pnpm lint:fix`                                        | Fixes what Biome can                                                               |
| `pnpm lint:architecture`                               | Checks dependencies and folders against the architecture                           |
| `pnpm lint:unused`                                     | Finds unused files, exports and dependencies                                       |
| `pnpm lint:generated`                                  | Fails when git ignores a file under `src`, where generated code never goes         |
| `pnpm lint:duplication`                                | Fails on duplicated code                                                           |
| `pnpm lint:spelling`                                   | Checks the spelling of the French messages                                         |
| `pnpm lint:html`                                       | Validates the built pages, after `pnpm build`                                      |
| `pnpm test`                                            | Runs unit and component tests                                                      |
| `pnpm test:coverage`                                   | Same, with coverage                                                                |
| `pnpm test:cucumber`                                   | Runs the abilities' Gherkin scenarios                                              |
| `pnpm test:e2e`                                        | Builds the site and runs the end-to-end tests                                      |
| `pnpm test:mutation`                                   | Runs mutation testing                                                              |
| `pnpm test:lighthouse`                                 | Audits the built site; on Ubuntu, prefix with `CHROME_PATH=/usr/bin/google-chrome` |
| `pnpm exec prek run --all-files --hook-stage pre-push` | Runs every hook on every file, tests included                                      |

## Branches

Work on a branch named after the change's [Conventional Commits](https://www.conventionalcommits.org) type, such as `feat/search-places` or `fix/language-switcher`, with one change per pull request.

## Commits

- Write each commit message as a Conventional Commit: a lower-case subject without a final period, a header of at most 72 characters, and a body that says why, wrapped at 72 characters. Scopes are reserved for `deps` (Renovate) and `release` (semantic-release). The messages decide the next version: a `fix` releases a patch, a `feat` a minor version.
- Sign your commits ([how](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)). The merge keeps your commits as they are, so they must carry your own signature.
- The hooks check each commit, each commit message and each push. Never bypass them with `--no-verify`.

## Propose a change

1. Before a large change, open an [issue](https://github.com/untracked-maps/untracked/issues) to talk about it first.
2. Write the tests first, then the code, following [`AGENTS.md`](AGENTS.md).
3. Put every text shown in `messages/`, in every language.
4. When the change picks a library, a protocol or a rule, or sets aside a plausible alternative, record it in an ADR in [`docs/adr`](docs/adr).
5. Run every check: `pnpm exec prek run --all-files --hook-stage pre-push`, then `pnpm test:e2e`.
6. Open a pull request against `main`. The `code`, `test` and `secrets` jobs must be green.

Use whatever tools you like, AI included. You are responsible for what you submit and must understand it; the same checks and the same review apply, whatever helped write it.

## Merging

Pull requests are merged by fast-forward from a local clone rather than with GitHub's button, whose rebase merge recreates the commits without their signatures:

```bash
git switch feat/something
git rebase main
git push --force-with-lease
git push origin feat/something:main
```

If `main` has moved on in the meantime, you may be asked to rebase your branch onto it, which keeps the history linear. A push to `main` that carries a `feat` or `fix` commit releases a new version and publishes the app and its documentation to GitHub Pages.
