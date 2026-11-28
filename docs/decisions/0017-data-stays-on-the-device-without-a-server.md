---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# Data stays on the device, without a server

## Context and Problem Statement

The app is a static site, without a server nor an account ([0002](0002-a-static-client-app-reading-map-data-from-outside-behind-ports.md)). It still has things to remember between visits: the theme chosen, the welcome acknowledged, a language suggestion dismissed, the recent searches, the layers of the map turned on, and later the places a visitor saves and their preferences. The promise of the app is that it keeps nothing about its visitors: no service of the project receives what they do.

A visitor who changes device, or clears the browser, must still be able to carry their places and preferences with them, without the project holding them.

Where is the visitor's data kept, and how does it leave the device when the visitor wants it to?

## Decision Drivers

- Nothing about a visitor reaches a server of the project, nor a third party.
- The app works on a device that refuses to store, for the length of the visit.
- What is read back from the device may come from another version, or another tool, and is never trusted.
- A visitor can take their data elsewhere, in a format other tools read.
- Only what is needed to show something again is kept, never a history of what the visitor did.

## Considered Options

- The browser's storage, behind ports, and a backup file the visitor keeps
- A server with accounts that keeps the data and syncs it between devices
- Session storage only, nothing kept beyond the tab

## Decision Outcome

Chosen option: « The browser's storage, behind ports, and a backup file the visitor keeps », because it keeps the promise of the app without a server to run, and gives the visitor, not the project, the copy of their data.

### The browser's storage, behind ports

What the app remembers is kept in the browser's storage, on the device only. Each ability reads and writes it through its ports, so that its domain does not know the storage and its scenarios play without a browser.

### Read back through a check

What is read back from the device is external data, like any other ([0013](0013-adapters-translate-external-formats-into-a-domain-of-value-objects.md)): it is checked when read, and what fails the check is skipped rather than trusted. A change of version never breaks the app on what an earlier one stored.

### A single GeoJSON file for the backup

The places a visitor keeps and their preferences leave the device in one file, which the visitor saves and opens again: a GeoJSON file, so that its places open in other mapping tools. With a password, the file is encrypted with a standard, and then opens only in the app. No backup exists yet. Target, tracked by #46.

### Consequences

- Good, because no server of the project holds anything about a visitor, and there is no account to secure.
- Good, because the app works without storage, and abilities are tested without a browser through their ports.
- Good, because a file from another version or another tool cannot break the app.
- Good, because a backup is a file of a known format, which the visitor owns.
- Bad, because data does not follow the visitor between devices on its own: the visitor carries the backup file.
- Bad, because clearing the browser loses what was not saved in a backup.
- Neutral, because an encrypted backup no longer opens in other tools, a choice left to the visitor.

## Pros and Cons of the Options

### A server with accounts that keeps the data and syncs it between devices

Data that follows the visitor everywhere. But it needs a server, accounts and their security, and it breaks the promise that the project keeps nothing about its visitors.

### Session storage only, nothing kept beyond the tab

Nothing outlives the tab. But what the app remembers serves the next visit first: a theme, a welcome or recent searches forgotten at each visit would be no memory at all.

## More Information

### Where to find the detail

- [The ability that keeps the recent searches](../../src/features/search/abilities/recent-searches/)
- [The ability that chooses the theme](../../src/features/appearance/abilities/choose-theme/)
- [The ability that welcomes the visitor](../../src/features/privacy/abilities/welcome-visitor/)

### References

- [0002: A static client app, reading map data from outside behind ports](0002-a-static-client-app-reading-map-data-from-outside-behind-ports.md)
- [0013: Adapters translate external formats into a domain of value objects, and check what they read](0013-adapters-translate-external-formats-into-a-domain-of-value-objects.md)
- [Web Storage, HTML standard](https://html.spec.whatwg.org/multipage/webstorage.html)
- [RFC 7946, GeoJSON](https://www.rfc-editor.org/rfc/rfc7946)

### History

- 2026-11-28, marc-gavanier: first writing.
