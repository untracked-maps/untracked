---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# Static checks by tools, hooks of a few seconds, and every check in CI

## Context and Problem Statement

The previous app was JavaScript without strict types, and a home-made script searched for misspelt property names because nothing else could. The rules of this code, a functional style without classes, mutable state or loops, explicit contracts on everything exported, no barrel file, no store, are only worth what checks them ([0001](0001-architecture-decisions-recorded-in-madr-and-checked-by-tools.md)): a rule that a reviewer must remember is soon broken.

Some checks take a few seconds, others, the tests with their coverage, the audit of dependencies, mutation, the end-to-end tests and Lighthouse, take minutes. Run before each push, the long ones made every push slow, and were bypassed or waited for.

Which tools should check the code, and where should each check run, so that no rule rests on review and no contributor waits on a check that CI runs anyway?

## Decision Drivers

- Every rule a tool can check is checked by a tool, not by a reviewer.
- One tool per concern, configured in the repository, the same on every machine and in CI.
- A commit waits a few seconds at most.
- Nothing merges without every check: CI runs them all.
- Hooks are never bypassed.

## Considered Options

- Strict TypeScript, Biome with GritQL plugins and deterministic checks, run by prek in hooks of a few seconds and all of them in CI
- ESLint and Prettier, with their Svelte plugins
- oxlint and oxfmt
- husky and lint-staged for the hooks
- Every check, long ones included, in the hooks

## Decision Outcome

Chosen option: « Strict TypeScript, Biome with GritQL plugins and deterministic checks, run by prek in hooks of a few seconds and all of them in CI », because one fast tool lints and formats every file, Svelte included, the rules no tool ships are written as plugins, and one configuration runs every check, npm package or not, on commit and in CI.

### Strict TypeScript

All code is TypeScript, components included, under strict mode and the stricter flags, with syntax that erases to JavaScript only and an explicit type on everything exported. The type check of components fails on warnings. TypeScript stays on the last major version that the checker of Svelte components supports.

### Biome, with GritQL plugins

Biome lints and formats the whole repository, Svelte files included, with its recommended rules and every other rule that fits as an error: functional style, safety, test hygiene, limits of size and complexity, imports of libraries the project refuses, such as stores, analytics or utility belts. The rules no built-in rule covers are GritQL plugins of the project: no class, no mutable binding, no loop, no test double, one assertion per test.

### Deterministic checks beyond linting

Each kind of mistake that types and lint leave is caught by a tool of its own: unused files, exports and dependencies; duplicated code; the built HTML against the standard; French spelling, and English spelling elsewhere; a missing translation; broken links between Markdown files at each commit, and every link weekly; unused step definitions of the scenarios; generated files under the source; secrets; the syntax and security of workflows; the format of commit messages.

### Hooks of a few seconds, every check in CI

prek runs the checks declared in one file, on commit, on push and on the commit message; CI runs them in parallel jobs, with the checks that need a build or a browser. Today the push hook also runs the tests with their coverage, the scenarios and the audit of dependencies, the last of which CI does not run itself. The target is hooks that run checks of a few seconds only, the long tests, the audit, mutation and performance running in CI; a check leaves the hooks only once CI runs it, so that nothing loses its control. Target, tracked by #156.

### Hooks are never bypassed

A commit or a push never skips its hooks with the option that disables them. A check that fails is fixed, or its rule is changed in its own configuration with a reason.

### Consequences

- Good, because a rule of the code holds without a reviewer, on every machine and in CI.
- Good, because one tool lints and formats, quickly, and checks every file the same way.
- Good, because a commit stays fast, and the long checks still block a merge in CI.
- Bad, because Biome's support of Svelte is marked experimental, and a cross-language rule may raise a false positive.
- Bad, because the GritQL plugins are code of the project, to maintain, for rules no maintained plugin offers.
- Bad, because a contributor learns of a failing long test only when CI runs it.
- Neutral, because a rule that no tool can check, such as no comments in code, stays a written rule.

### Confirmation

CI runs the checks on each pull request; a hook or a job that fails blocks the commit or the merge. Each new automated rule is proven by a deliberate violation.

## Pros and Cons of the Options

### ESLint and Prettier, with their Svelte plugins

Complete and stable on Svelte. Two tools instead of one, slower, and two configurations to keep in step.

### oxlint and oxfmt

Fast, and close to ESLint's rules. oxlint lints only the script blocks of Svelte files.

### husky and lint-staged for the hooks

Common in JavaScript projects. They run npm tools only: the checks that are not npm packages, such as the secret scanner or the workflow linters, would become scripts of their own, and CI would repeat each command.

### Every check, long ones included, in the hooks

A failing test is seen before the push. Every push waits for minutes of checks that CI runs anyway, which invites bypassing them.

## More Information

### Where to find the detail

- [The TypeScript configuration](../../tsconfig.json)
- [The Biome configuration](../../biome.json)
- [The GritQL plugins](../../.grit/)
- [The hooks](../../.pre-commit-config.yaml)
- [The checks in CI](../../.github/workflows/checks.yml)

### References

- [TypeScript's strict options](https://www.typescriptlang.org/tsconfig/#strict)
- [Biome](https://biomejs.dev/)
- [GritQL plugins of Biome](https://biomejs.dev/reference/gritql/)
- [prek](https://prek.j178.dev/)
- [#156: reduce the git hooks to checks of a few seconds](https://github.com/untracked-maps/untracked/issues/156)

### History

- 2026-11-28, marc-gavanier: first writing.
