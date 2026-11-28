---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# Dependencies admitted by policy, and licences compatible with the AGPL

## Context and Problem Statement

The app is a static site without a server or account: what can harm its visitors is code that runs in their browser. That code comes from hundreds of npm packages, direct and transitive. Attacks on the npm supply chain multiply: a maintainer's account is taken over, a trapped version is published, its install script runs on developers' machines and in CI. Such versions are usually found and withdrawn within days. The workflows that build and publish the site run third-party actions, and a moving tag can point an action at other code.

The code is under the GNU Affero General Public License, version 3 only, as the previous app was: whoever serves a modified version must offer its source. A dependency bundled in the app must allow that, and some, such as the opening-hours library under the LGPL, ask the app to say that they are used and to ship their licence texts.

How should a third-party package reach the repository and the browser, so that a trapped release, a vulnerable version or an incompatible licence is stopped before it ships?

## Decision Drivers

- No third-party code runs on a machine, in CI or in the browser without a lockfile, a delay and an explicit decision.
- A vulnerability in what ships fails the build; one in a development tool is reported without blocking work.
- Every dependency that ships has a licence compatible with the AGPL, and its notices are served with the site.
- Updates come by themselves, grouped, and pass every check like any change.

## Considered Options

- pnpm with a minimum release age and a trust policy, Renovate, OSV-Scanner on an SBOM, CodeQL, dependency review with a licence list, Scorecard, and the notices served by the site
- Dependabot for updates and alerts
- Lowering the release age when a version is needed
- Install scripts allowed by default

## Decision Outcome

Chosen option: « pnpm with a minimum release age and a trust policy, Renovate, OSV-Scanner on an SBOM, CodeQL, dependency review with a licence list, Scorecard, and the notices served by the site », because every package then passes a delay, a lockfile and a check of its licence and vulnerabilities before it ships, and every update comes as a pull request that runs every check.

### pnpm admits a version only after a delay and with its trust

pnpm refuses a version younger than a minimum release age, so that a trapped release has time to be caught, and a version published with weaker trust guarantees than the ones before it. It pins exact versions, fails on unmatched peers and on a stale install, and runs no install script that is not allowed by name. A package that must escape a rule is excluded by its exact version, with its reason, and the exclusion is lifted once it has none.

### Renovate proposes the updates

Renovate proposes the updates weekly, after the same delay, minor and patch updates grouped, pins GitHub Actions by their digest, updates the pinned hooks, and raises alerts from OSV.

### Vulnerabilities found by OSV-Scanner, code by CodeQL

OSV-Scanner reads a CycloneDX SBOM of the lockfile: a vulnerability in a production dependency fails the build; those of development dependencies, which never ship, are reported to code scanning. CodeQL analyses the code with its extended security queries on each pull request, on the main branch and weekly. OpenSSF Scorecard rates the practices of the repository. Each release attaches the SBOM of its production dependencies.

### Licences compatible with the AGPL

The code is under the AGPL-3.0-only. GitHub's dependency review refuses a pull request that adds a dependency whose licence is outside a list compatible with it; a development dependency under another licence, which never ships, is allowed by name.

### The notices that licences ask for are served by the site

A library whose licence asks for a notice has it served by the site: the notice of the opening-hours library and the texts of the GPL and the LGPL can be read from the published site. The target is a Licences page, linked from the page about the app, built from the bundler's list of licences, with hand-written blocks for what it does not list, such as the font. Target, tracked by #131.

### Consequences

- Good, because a trapped version withdrawn within the release age never reaches a machine, CI or the browser.
- Good, because no package runs code at install without a decision.
- Good, because a vulnerable production dependency fails the build, and every release says what it ships.
- Good, because the licence of a new dependency is checked before it is merged, and the published site carries the notices it owes.
- Bad, because a security fix waits for the release age too, unless its exact version is excluded.
- Bad, because the exclusions and the allowed install scripts are kept by hand, and a forgotten exclusion leaves a door open.
- Bad, because Renovate is a third-party application with write access to the repository.
- Neutral, because the licence of the code is a choice of the project as much as a constraint of architecture: it is recorded here for what it asks of the dependencies.

### Confirmation

pnpm's settings refuse what the policy refuses at each install; the security workflow runs OSV-Scanner, CodeQL and dependency review; the licence texts the site serves are tested.

## Pros and Cons of the Options

### Dependabot for updates and alerts

Built into GitHub, without a third-party application. It does not update the pinned hooks, which would then age unseen.

### Lowering the release age when a version is needed

A version is had at once. The option opens the whole lockfile to fresh versions, not only the package needed; an exclusion by exact version keeps the protection for everything else.

### Install scripts allowed by default

npm's historic behaviour, which needs no list. It is the way worms spread; the list costs a line per native package.

## More Information

### Where to find the detail

- [The settings of pnpm](../../pnpm-workspace.yaml)
- [The settings of Renovate](../../renovate.json)
- [The security checks](../../.github/workflows/security.yml)
- [Scorecard](../../.github/workflows/scorecard.yml)
- [The release, with its SBOM](../../.github/workflows/release.yml)
- [The licence](../../LICENSE)
- [The licence texts served by the site](../../src/libraries/license-texts/)

### References

- [pnpm's minimum release age](https://pnpm.io/settings#minimumreleaseage)
- [pnpm's trust policy](https://pnpm.io/settings#trustpolicy)
- [Renovate](https://docs.renovatebot.com/)
- [OSV-Scanner](https://google.github.io/osv-scanner/)
- [CodeQL](https://codeql.github.com/)
- [OpenSSF Scorecard](https://scorecard.dev/)
- [CycloneDX](https://cyclonedx.org/)
- [GNU AGPL v3](https://www.gnu.org/licenses/agpl-3.0.html)
- [GNU LGPL v3, section 4](https://www.gnu.org/licenses/lgpl-3.0.html)
- [#131: a Licences page linked from About](https://github.com/untracked-maps/untracked/issues/131)

### History

- 2026-11-28, marc-gavanier: first writing.
