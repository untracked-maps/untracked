# ADR-018 — Security checks

**Date**: 2026-11-15
**Status**: accepted

## Context

The app is a static site: no server, no account, no stored data. Of the [OWASP Top 10](https://owasp.org/Top10/), what applies is injection in the browser (cross-site scripting), security misconfiguration, vulnerable and outdated components, and software and data integrity failures in the supply chain. Secrets, workflows, licences and the supply chain were already covered: gitleaks, zizmor, Biome's licence rule, pnpm's release age, trust policy and build-script review, `pnpm audit` and Renovate's OSV alerts.

## Decision

- **Content Security Policy.** SvelteKit generates a strict policy in `hash` mode, delivered through a `<meta http-equiv>` tag since GitHub Pages sends no custom header: only the site's own scripts, styles, images, fonts and connections, no plugin, no base or form target elsewhere. SvelteKit's route announcer carries a fixed inline style, allowed by its own hash through `style-src-attr` with `'unsafe-hashes'`, computed at build time from the style itself. End-to-end tests check the policy, and Lighthouse fails on any violation reported in the console. A new external service is added to `connect-src` with the feature that uses it.
- **No raw HTML.** Biome's `noSvelteAtHtmlTags` forbids `{@html}`.
- **CodeQL** analyses the code with its `security-extended` queries on every pull request, on `main` and weekly; its alerts appear in GitHub's code scanning.
- **OSV-Scanner** checks dependencies against the OSV database through a CycloneDX SBOM that `pnpm sbom` writes from the lockfile: OSV-Scanner reads only the first document of pnpm 12's lockfile, and does not read CycloneDX 1.7 yet, so the SBOM is written in 1.6. A vulnerability in a production dependency fails the build; vulnerabilities in development dependencies are reported to code scanning without failing it, since a transitive development dependency often has no fix yet, and never ships.
- **Dependency review** blocks a pull request that adds a dependency with a known vulnerability in production, or with a licence outside a list compatible with the AGPL. Seven development dependencies with other licences, which never ship, are allowed by name: `sentry` (FSL, used by Lighthouse to report its own crashes, an opt-in this project does not turn on, not verified), `npm` (Artistic), `argparse` (Python), `caniuse-lite` (CC BY), `spdx-exceptions` (CC BY), and two cspell dictionaries (WTFPL, CC BY-SA).
- GitHub's dependency graph does not tell development from production dependencies in a pnpm lockfile, so dependency review treats them all as production and fails on any of them. Three advisories of `basic-ftp` 5.3.1 are allowed by identifier (`GHSA-c475-qrg2-pj4r`, `GHSA-5pm8-86m8-9m6r`, `GHSA-r4jh-29pc-gfqr`): it comes with Lighthouse CI through `proxy-agent`, `pac-proxy-agent` and `get-uri`, only fetches proxy scripts over FTP, which this project never configures, and never ships. Their fixes exist only in `basic-ftp` 6, which even the latest `get-uri` (8.0.1) does not accept; forcing it with an override would run an untested major version. OSV-Scanner still reports them, and the exception goes once `get-uri` moves to `basic-ftp` 6.
- **OpenSSF Scorecard** rates the repository's security practices on `main` and weekly, and publishes the result.
- **SBOM.** Each release attaches the CycloneDX SBOM of its production dependencies.

## Consequences

- On 2026-11-15, OSV-Scanner found vulnerabilities in five development dependencies (`qs` through Stryker, `glob` and `minimatch` through folderslint, `deepmerge` through SvelteKit's Vite plugin, `basic-ftp` through Lighthouse CI) and none among the 21 production components.
- The announcer's hash changes if SvelteKit changes its style; Lighthouse then fails, and the style in `vite.config.ts` is updated.
- CodeQL's support of `.svelte` files is not verified; their logic lives in TypeScript modules, which it reads.

## Alternatives considered

- **OWASP ZAP**, a dynamic scan of the built site: it mostly reports headers that GitHub Pages cannot send.
- **Semgrep** with its OWASP rules: a second static analysis next to CodeQL, left for later.
- **`'unsafe-inline'` for styles**: it would allow any inline style, where one fixed style needs allowing.
