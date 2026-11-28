---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# The URL is the public interface of the app

## Context and Problem Statement

The app is a static site without a server ([0002](0002-a-static-client-app-reading-map-data-from-outside-behind-ports.md)), prerendered by SvelteKit ([0004](0004-a-sveltekit-site-prerendered-as-static-files.md)). A reload or a shared link must reopen what the visitor was looking at: the language, the view of the map, a place or a spot. Links outlive releases: once shared, they are a contract with every person and site that holds them. A static site cannot read a cookie before it sends a page, and a URL's query string reaches the host of the site and every service the page calls, whereas its fragment is never sent to a server nor in the `Referer` header.

The back button must also close what is open before it leaves the app, and SvelteKit's router keeps its own state in each entry of the history.

Where does the state that a link carries live, in which format, and who writes the history?

## Decision Drivers

- A link opens the same thing on every device and in every release.
- What a link carries stays in the browser, never sent to a server or a third party.
- A known format, so that links from and to other maps work.
- The format and its checks are rules of a domain, tested like any other.
- The history stays consistent with SvelteKit's router.

## Considered Options

- The locale in the path, the view and shared links in the fragment after OpenStreetMap's format, the history through SvelteKit's router
- The view and shared links in the query string
- MapLibre's own hash option
- The keys of the former app

## Decision Outcome

Chosen option: « The locale in the path, the view and shared links in the fragment after OpenStreetMap's format, the history through SvelteKit's router », because each part of the URL then carries what it serves best: the path what the server must prerender, the fragment what must stay in the browser.

### The locale in the path

The language is part of the path: the base language at the root, every other one under its own prefix. It is read from the URL only, so that each language is a set of prerendered pages, and a link always opens in its own language.

### The view and shared links in the fragment

The view of the map lives in the fragment, as OpenStreetMap writes it: the key of the map, then the zoom, the latitude and the longitude. The fragment is read as pairs of keys and values, so that a shared place or a shared spot adds its own key next to the view. One ability owns the format: it reads the view and the link that a URL asks for, checks them, and gives the fragments to write; an invalid fragment opens the default view. Its rules are scenarios.

### The history through SvelteKit's router

The app changes the URL and the history only through SvelteKit's router, never through the browser's history interface directly. Moving the map replaces the fragment without adding an entry, so that the back button never steps through every move. What opens over the map adds one shallow entry, so that the back button closes it before it leaves the app. One ability decides what closes, from what is open and from the steps in the history; the history is its port.

### Consequences

- Good, because a link carries the language, the view, a place or a spot, and opens them again after a reload or on another device.
- Good, because the fragment stays in the browser: neither the host of the site nor the services the page calls see what a link opens.
- Good, because the format is OpenStreetMap's, and its checks are tested as rules of a domain.
- Good, because SvelteKit's router keeps its state in every entry it creates.
- Bad, because the format is a public contract: a change of a key breaks every link already shared, and links of the former app open the default view.
- Bad, because a fragment pasted into a tab where the app is already open is not followed until the page reloads, a defect tracked by #161.

## Pros and Cons of the Options

### The view and shared links in the query string

A familiar form, readable by a server. But the query string is sent to the host of the site and in the `Referer` header to every service the page calls, and changing it through SvelteKit's router is a navigation.

### MapLibre's own hash option

No code to write. But the format and its validation would sit in the renderer, outside the domain and its scenarios, and it writes the history through the browser's interface, which SvelteKit's router warns against.

### The keys of the former app

Links of the former app would keep working. But they were French words in an app whose base language is English, while OpenStreetMap's key is the one other maps read.

## More Information

### Where to find the detail

- [The ability that keeps the view and the links in the URL](../../src/features/map/abilities/keep-view-in-url/)
- [The ability that closes what is open](../../src/features/navigation/abilities/close-what-is-open/)

### References

- [0002: A static client app, reading map data from outside behind ports](0002-a-static-client-app-reading-map-data-from-outside-behind-ports.md)
- [0004: A SvelteKit site prerendered as static files](0004-a-sveltekit-site-prerendered-as-static-files.md)
- [OpenStreetMap, browsing the map and its URL](https://wiki.openstreetmap.org/wiki/Browsing)
- [RFC 9110, section 10.1.3, Referer](https://www.rfc-editor.org/rfc/rfc9110#section-10.1.3)
- [SvelteKit, shallow routing](https://svelte.dev/docs/kit/shallow-routing)
- [Paraglide JS, strategies](https://paraglidejs.com/strategy)

### History

- 2026-11-28, marc-gavanier: first writing.
