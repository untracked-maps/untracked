---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# Translations compiled by Paraglide, without a redirect by language

## Context and Problem Statement

Every text the app shows must be translatable, on a static site prerendered by SvelteKit ([0004](0004-a-sveltekit-site-prerendered-as-static-files.md)), whose language is part of the path ([0015](0015-the-url-is-the-public-interface-of-the-app.md)). Paraglide JS is SvelteKit's official integration for translations: it compiles messages into functions that the bundler can drop when unused, and its hook runs while prerendering too. By default, its command line loads the plugin that reads messages from a CDN at build time, outside the lockfile, its integrity and the release age of the package manager.

The browser tells the visitor's preferred languages, so the app could send a visitor to their language on its own. A redirect after a prerendered page has loaded shows the wrong language first, search engines advise against automatic redirects between language versions, and a person whose browser is set to one language may prefer another.

How are texts translated, and what does the app do with the visitor's preferred language?

## Decision Drivers

- Texts translated through SvelteKit's official mechanism, without a server.
- No text written in code: every text is a message, in every language.
- A build that opens no network connection.
- Every language reachable by its address, by people and by search engines.

## Considered Options

- Messages compiled by Paraglide from files of the repository, and no redirect by language
- A redirect from the root to the preferred language, once, remembered
- Every language under its own prefix, the root a page to choose the language
- Paraglide as its command line sets it up, its plugin loaded from a CDN at build time

## Decision Outcome

Chosen option: « Messages compiled by Paraglide from files of the repository, and no redirect by language », because Paraglide is the official integration and works in a static build, and a site that never redirects shows each page in the language of its address.

### Every text is a compiled message

Every text shown is a message of a file per language, called through the compiled functions. A text written in a component is a defect, and a check fails on a message missing from a language. The plugin that reads the messages is a development dependency read from the installed packages, so that the build opens no network connection.

### Generated code outside the sources

Paraglide writes its compiled code to a hidden folder at the root of the repository, ignored by Git, as SvelteKit does for its own output: the sources hold only code written by hand. The dependency rules see every import of the compiled messages, so that they decide who may use translations: routes and interfaces, never a domain.

### The site never redirects by language

The app never changes the language on its own. When the browser prefers a language the site offers and the page is in another, the app may suggest the other address; the rule of that suggestion is a scenario of its ability, composed in the browser only, since the preferred languages do not exist while prerendering. A choice the visitor makes about it stays on the device.

### Consequences

- Good, because messages are checked at build time, and an unused message weighs nothing.
- Good, because domains know nothing of languages: their rules give values, and presenters turn them into messages.
- Good, because the build depends only on the lockfile.
- Good, because a visitor and a search engine reach every language by its address, and a link opens in the language it names.
- Bad, because a visitor whose browser prefers another language first lands on the page of the address, and is only offered the other one.
- Bad, because some tools do not see a plugin referenced from Paraglide's settings, and must be told of it.

## Pros and Cons of the Options

### A redirect from the root to the preferred language, once, remembered

The visitor lands in their language. But the prerendered page shows the wrong language before the redirect, search engines advise against it, and Paraglide's strategy reading the address applies before the preferred language anyway.

### Every language under its own prefix, the root a page to choose the language

The common pattern for an automatic choice. But every address changes, the root becomes a page without content, and Paraglide needs patterns of its own for every address.

### Paraglide as its command line sets it up, its plugin loaded from a CDN at build time

Nothing to configure. But the build then downloads code outside the lockfile, without integrity nor release age, and fails without a network.

## More Information

### Where to find the detail

- [The messages of each language](../../messages/)
- [The ability that suggests the visitor's language](../../src/features/languages/abilities/suggest-language/)
- [The settings of Paraglide](../../project.inlang/settings.json)

### References

- [0004: A SvelteKit site prerendered as static files](0004-a-sveltekit-site-prerendered-as-static-files.md)
- [0015: The URL is the public interface of the app](0015-the-url-is-the-public-interface-of-the-app.md)
- [Paraglide JS for SvelteKit](https://paraglidejs.com/sveltekit)
- [Paraglide JS, strategies](https://paraglidejs.com/strategy)
- [SvelteKit, hooks](https://svelte.dev/docs/kit/hooks)
- [Google Search, managing multi-regional and multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)

### History

- 2026-11-28, marc-gavanier: first writing.
