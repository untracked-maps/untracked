# Security policy

## Supported versions

Only the latest release, published from `main`, is supported: fixes land on `main` and ship in the next release, and are not backported.

## Reporting a vulnerability

Do not open a public issue for a vulnerability. Report it privately through [GitHub's private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability): open the repository's **Security** tab and choose [**Report a vulnerability**](https://github.com/untracked-maps/untracked/security/advisories/new).

Include in the report:

- the release or the commit of `main` you tested, and the browser;
- the steps to reproduce, as short as possible;
- what an attacker gains, and what they need beforehand.

Say which tools helped you find or write up the issue, and check their findings yourself before sending them.

## What happens next

The report stays private between you and the maintainers while it is assessed, in the draft advisory GitHub opens for it. If it is confirmed, the fix is prepared in private and released, then the advisory is published, crediting you unless you prefer otherwise. If it is not, the advisory says why and is closed.

## Scope

Untracked Maps is a static site that runs in the browser and promises not to track its visitors ([0018](docs/decisions/0018-the-browser-talks-only-to-declared-services.md), [0019](docs/decisions/0019-a-strict-content-security-policy-built-from-hashes.md)). In scope:

- running code in a visitor's browser that the site did not ship, such as cross-site scripting, or bypassing its Content Security Policy;
- any data about a visitor leaving the browser for a destination the site does not declare;
- a release whose content differs from what the repository builds, or a compromised dependency in a release.

Out of scope, to report to their own projects: GitHub Pages, the browsers, and the external services and open data the app reads.
