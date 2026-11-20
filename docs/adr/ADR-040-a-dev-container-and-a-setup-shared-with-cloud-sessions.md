# ADR-040 — A Dev Container, and a setup shared with cloud sessions

**Date**: 2026-11-20
**Status**: accepted

## Context

The contributing guide listed Node.js, pnpm, Graphviz and Chrome, but nothing of what the hooks need. prek installs each hook at the version its configuration pins, and the toolchains with it: Go for actionlint and gitleaks, downloaded from `go.dev`, which redirects to `dl.google.com`; uv and Python for zizmor and typos; a lychee binary from GitHub's releases. Behind a filtered network, nothing said which hosts to open.

A contributor working in Claude Code's cloud sessions met exactly that: neither `go.dev` nor `dl.google.com` is in the sessions' default allowlist. Three hooks did not install, were skipped by hand, then installed by hand, lychee compiled from crates.io: the right versions, but nothing that the next session would find again. These sessions start from Node.js 22 while the project needs 24, cache their environment setup script apart from the repository, cloned afresh at each session, and do not support Dev Containers.

## Decision

- **One versioned setup, `.devcontainer/setup.sh`**, holds every step that depends on the repository: it checks Node.js 24 or later, installs the locked dependencies, the git hooks with their environments (`prek install --install-hooks`) and Playwright's Chromium with its system libraries.
- **A Dev Container**, `.devcontainer/devcontainer.json`, the open [Development Containers](https://containers.dev) specification read by VS Code, JetBrains IDEs and GitHub Codespaces: Microsoft's Node.js 24 image on Debian trixie, pinned by digest, since the lychee binary needs glibc 2.38 and bookworm has 2.36; pnpm through Corepack, then the setup. CI's `Dev Container` job builds it and runs every commit hook inside, so that the environment is proven, not described.
- **Claude Code's cloud sessions** run the same setup through a `SessionStart` hook in `.claude/settings.json`, only when `CLAUDE_CODE_REMOTE` is `true`: it runs at each session, in the fresh clone. The environment's own setup script, cached but blind to the repository, installs only Node.js 24; the contributing guide gives it, with the hosts to allow.
- **The contributing guide lists the hosts** the setup reaches, so that a filtered network is opened rather than worked around.
- **A commit message never links a Claude session**: a commitlint rule refuses `claude.ai/code/session_`, in the commit hook and in CI. A session is private to its author, and such a link landed on `main` with #22.

## Consequences

- No hook is ever skipped or installed by hand: a missing host is added to the allowlist, and prek does the rest.
- The `SessionStart` hook and the cloud setup script cannot be tested from CI: they are checked by a contributor in a cloud session, and corrected here when they fail.
- The hook runs at every cloud session start, without a cache, and adds its time to it.

## Alternatives considered

- **Documenting the prerequisites only**: nothing proves them, and each contributor rebuilds the environment by hand.
- **mise to pin Node.js, pnpm and Go**: a second tool beside prek, which already installs the hooks' toolchains, and nothing for Playwright's system libraries.
- **The whole setup in the cloud environment's setup script**: cached, but run apart from the repository, and kept outside it, in each contributor's settings.
- **An instruction in `AGENTS.md` to run the setup**: nothing Claude-specific in the repository, but it rests on the agent following it.

## Update, 2026-11-20: Node.js 24 first in cloud sessions

Checked in a fresh cloud session by a contributor, the setup failed at once: the setup script linked Node.js 24 into `/usr/local/bin`, which comes after `/opt/node22/bin` in the sessions' `PATH`, so the hook found Node.js 22. The setup script also needed Playwright's hosts, and the cloud settings refuse a line longer than 200 bytes.

- The setup script installs Node.js 24 in `/opt/node24`, after checking its checksum, in lines under 80 characters.
- `.claude/cloud-session.sh`, run by the `SessionStart` hook, puts `/opt/node24/bin` first in the `PATH` of the setup and, through `CLAUDE_ENV_FILE`, of every later command of the session, git hooks included.
- The contributing guide lists Playwright's hosts among those to allow.

Checked in a container that starts from Node.js 22 first in the `PATH`, as root, as the sessions do: the setup completes, and the next command finds Node.js 24 and pnpm.
