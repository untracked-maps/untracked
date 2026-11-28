---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# The browser talks only to declared services

## Context and Problem Statement

The repository produces no map data ([0002](0002-a-static-client-app-reading-map-data-from-outside-behind-ports.md)): the basemap, the aerial photos, the transit lines and the bike lanes come from services that the browser calls directly. Each of them then sees the visitor's IP address, and often the area they look at. Data stays on the device ([0017](0017-data-stays-on-the-device-without-a-server.md)), and the app promises to keep nothing about its visitors; a service called without need, a script of analytics or a request made to check whether a provider is up would each break that promise without anyone noticing.

Which services may the browser call, when, and how does the visitor know?

## Decision Drivers

- No request leaves the browser without a reason the visitor can read.
- A third party sees only what the feature the visitor uses needs.
- The list of services is complete and stays true, change after change.
- No dependency of the project watches its visitors.

## Considered Options

- Only declared services, a third party called once the visitor turns on what needs it, each listed with what it sees
- Every external service the features find useful, from the first load
- Every map asset served by the project, without any third party

## Decision Outcome

Chosen option: « Only declared services, a third party called once the visitor turns on what needs it, each listed with what it sees », because it keeps third parties to what the visitor asks for, and makes the list of who sees what part of the change that adds a service.

### A third party only once the visitor turns on what needs it

The basemap, without which there is no map, is the one service called when the app opens. Every other service is called only once the visitor turns on the feature that needs it, and nothing is requested from it before. The code of such a feature is loaded at that moment too.

### Every service declared, with what it sees

Every host the browser may call is allowed by the Content Security Policy, and listed on the page « Who sees what », with what it sees, why and when. A change that adds a service adds it to both. What the app can serve itself, such as the glyphs, the icons and the fonts of the map, it serves itself, so that a provider sees only what it alone can give.

### No tracking, no probing

The app holds no analytics, monitoring or session recording, and no map service that tracks its users: the linter refuses their packages. An outage of a provider is inferred from the renderer's own events on the requests it already makes, never by calling a status service, and a fallback of the same provider is tried before the outage is told.

### Consequences

- Good, because a visitor who turns nothing on is seen by the basemap provider alone.
- Good, because the page « Who sees what » is the list of every host the policy allows, kept true by the change that adds one.
- Good, because an outage costs no extra request, and a blocked address of the provider does not empty the map while its fallback answers.
- Bad, because the providers keep their own logs, which the app does not control and which most of them do not describe.
- Bad, because the app has no measure of its use: what visitors do is known only from what they report.
- Neutral, because the end-to-end tests answer every external request themselves, so that they do not depend on any provider.

## Pros and Cons of the Options

### Every external service the features find useful, from the first load

Simpler features, and data ready before the visitor asks. But every visitor would be seen by every provider, for features most of them never turn on, and the list of who sees what would describe a promise the app does not keep.

### Every map asset served by the project, without any third party

No one but the site would see the visitor. But serving the basemap and the other layers means producing and hosting map data, which belongs to another project.

## More Information

### Where to find the detail

- [The page « Who sees what »](../../src/features/privacy/ui/pages/who-sees-what.svelte)
- [The packages the linter refuses](../../biome.json)
- [The ability that tells an outage of the basemap](../../src/features/map/abilities/report-basemap-outage/)
- [The hosts the Content Security Policy allows](../../vite.config.ts)

### References

- [0002: A static client app, reading map data from outside behind ports](0002-a-static-client-app-reading-map-data-from-outside-behind-ports.md)
- [0017: Data stays on the device, without a server](0017-data-stays-on-the-device-without-a-server.md)
- [Content Security Policy, connect-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/connect-src)
- [OpenFreeMap](https://openfreemap.org/)
- [IGN Géoplateforme](https://geoservices.ign.fr/)
- [Île-de-France Mobilités open data](https://data.iledefrance-mobilites.fr/)

### History

- 2026-11-28, marc-gavanier: first writing.
