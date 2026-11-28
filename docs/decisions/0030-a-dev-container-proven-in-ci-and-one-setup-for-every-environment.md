---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# A Dev Container proven in CI, and one setup for every environment

## Context and Problem Statement

The checks of the repository need more than Node.js and pnpm ([0027](0027-static-checks-by-tools-fast-hooks-and-every-check-in-ci.md)): the hooks install their own toolchains, Go, Python and Rust among them, at the versions their configuration pins, from hosts of their own; the tests need a browser and its system libraries; the documentation needs Graphviz. The contributing guide listed some prerequisites and nothing of what the hooks need. Behind a filtered network, nothing said which hosts to open, and hooks were skipped, then installed by hand, in ways the next session would not find again.

Contributors also work in remote development sessions that start from another version of Node.js, clone the repository afresh each time, and cannot run a Dev Container.

How should the development environment be set up, so that it is the same everywhere, and proven rather than described?

## Decision Drivers

- One setup, versioned in the repository, for every environment.
- An open standard, read by the usual editors and hosted environments.
- Proven by CI, not described in a guide.
- No tool beside those the repository already uses.

## Considered Options

- A Dev Container built and checked in CI, and its setup script run by every environment
- The prerequisites documented only
- mise to pin Node.js, pnpm and the hooks' toolchains
- Each environment's own setup, kept outside the repository

## Decision Outcome

Chosen option: « A Dev Container built and checked in CI, and its setup script run by every environment », because the open specification of Development Containers is read by the usual editors and hosted environments, and a CI job that builds it and runs every hook inside proves it at each change.

### One versioned setup

One script of the repository holds every step that depends on it: it checks the version of Node.js, installs the locked dependencies, the git hooks with their environments and the browser of the tests with its system libraries.

### A Dev Container, proven in CI

The Dev Container starts from a Node.js image pinned by its digest, enables pnpm, then runs the setup. A CI job builds it and runs every commit hook inside.

### The same setup in remote sessions

Remote development sessions that cannot run a Dev Container run the same script when they start, and put the right version of Node.js first. The contributing guide lists the hosts the setup reaches, so that a filtered network is opened rather than worked around.

### Consequences

- Good, because no hook is ever skipped or installed by hand: a missing host is opened, and the setup does the rest.
- Good, because the environment is proven at each change, by the same hooks as every commit.
- Good, because a new contributor gets a working environment from the editor, without reading a list of prerequisites.
- Bad, because the start of a remote session cannot be tested from CI: it is checked in a session, and corrected when it fails.
- Bad, because the setup runs at every remote session, without a cache, and adds its time to the start.
- Neutral, because a contributor may still work without the container, with the prerequisites of the contributing guide.

### Confirmation

CI's Dev Container job builds the container and runs every commit hook in it.

## Pros and Cons of the Options

### The prerequisites documented only

Nothing to build. Nothing proves the list, and each contributor rebuilds the environment by hand.

### mise to pin Node.js, pnpm and the hooks' toolchains

One file for the versions. A second tool beside the hook manager, which already installs the hooks' toolchains, and nothing for the browser's system libraries.

### Each environment's own setup, kept outside the repository

Cached by the environment, and fast to start. Run apart from the repository, kept in each contributor's settings, and seen by no review.

## More Information

### Where to find the detail

- [The Dev Container and its setup](../../.devcontainer/)
- [The Dev Container job in CI](../../.github/workflows/checks.yml)
- [The contributing guide, with the hosts to allow](../../CONTRIBUTING.md)

### References

- [Development Containers](https://containers.dev/)
- [devcontainers/ci](https://github.com/devcontainers/ci)

### History

- 2026-11-28, marc-gavanier: first writing.
