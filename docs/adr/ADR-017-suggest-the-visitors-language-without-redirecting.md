# ADR-017 — Suggest the visitor's language, never redirect

**Date**: 2026-11-15
**Status**: accepted

## Context

The site is static and prerendered: English at `/`, French at `/fr`. The browser exposes the visitor's preferred languages (`navigator.languages`), so the app could send a French visitor to `/fr` automatically.

- Google advises to "avoid automatically redirecting users from one language version of a site to a different language version", because such redirects "could prevent users (and search engines) from viewing all the versions of your site", and suggests links to the other versions instead ([Managing multi-regional and multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)).
- Paraglide's `url` strategy resolves an unprefixed path to the base locale before any later strategy, so its `preferredLanguage` strategy never applies to `/`, and it does not redirect on the client ([strategies](https://paraglidejs.com/strategy)).
- A redirect after the prerendered page has loaded shows the wrong language first, then the right one.
- A person whose browser is set to one language may prefer another one.

## Decision

- The site never redirects on its own. When the browser prefers a language the site offers and the page is in another one, a banner suggests the page in that language, written in that language, with a link to it and a button to dismiss it.
- The first preferred language the site offers wins; a regional variant matches its language (`fr-CA` gives `fr`).
- A dismissal is kept in `localStorage`, on the device only, and the banner does not come back. Nothing leaves the browser.
- The ability `languages/suggest-language` holds the rule as a pure function and the use case as a stream function of two ports, the preferred languages and the dismissal; the browser adapters read `navigator.languages` and `localStorage`. The root layout composes them in the browser only, since neither exists while prerendering.

## Consequences

- A visitor whose browser prefers French lands on the English home page and reads the suggestion in French.
- The banner appears once the app has started. Lighthouse measured no layout shift on either page.

## Alternatives considered

- **Redirect from `/` once, and remember the choice**: shows the English page before redirecting, and goes against Google's advice.
- **Prefix every language (`/en`, `/fr`) and make `/` a language selection page**: the standard pattern for an automatic choice, but every address changes and Paraglide needs custom URL patterns.
