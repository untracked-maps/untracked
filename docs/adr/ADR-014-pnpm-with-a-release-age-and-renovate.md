# ADR-014 — pnpm with a minimum release age, and Renovate

**Date**: 2026-11-15
**Status**: accepted

## Decision

- pnpm, pinned in `packageManager`, installs dependencies. It refuses versions published less than ten days ago (`minimumReleaseAge: 14400` minutes in `pnpm-workspace.yaml`), to leave time for a compromised release to be caught.
- pnpm also refuses a version published with weaker trust guarantees than earlier ones (`trustPolicy: no-downgrade`), fails when `node_modules` is stale (`verifyDepsBeforeRun: error`) or when peer dependencies do not match (`strictPeerDependencies`), pins exact versions (`saveExact`), and keeps its defaults that refuse exotic transitive sources and unreviewed build scripts. Two development dependencies were published without provenance after versions that had it, `chokidar@4.0.3` (from svelte-check) and `chromium-bidi@157.0.8090-0` (from Lighthouse CI): they are excluded by exact version. Lighthouse CI's `@puppeteer/browsers` asks for `proxy-agent` 8 while Lighthouse CI installs 6, which Lighthouse runs with: `peerDependencyRules` accepts that one case.
- Renovate, with its `config:best-practices` preset, proposes updates weekly, waits as long, groups minor and patch updates, pins GitHub Actions by digest, updates prek hooks, and raises vulnerability alerts from OSV.
- `pnpm audit --prod` runs before each push.

## Consequences

- A fresh release of a dependency waits ten days, unless an exception with its reason is added to `pnpm-workspace.yaml`.

## Alternatives considered

- **Dependabot**, as in la Cartographie nationale: no release age, and no prek hook updates.
