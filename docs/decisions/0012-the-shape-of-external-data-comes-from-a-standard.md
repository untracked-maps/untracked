---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# The shape of external data comes from a standard, in a fixed order

## Context and Problem Statement

The map data comes from outside the repository, behind ports ([0002](0002-a-static-client-app-reading-map-data-from-outside-behind-ports.md)), and its real sources are not all chosen: each ability reads fake data shaped the way a real source will be read. Places need a phone, a website, an address, opening hours, a country, photos and a description; stations need departures and exits; districts need outlines; pictures need a position and a heading. Left to each change, these shapes would be invented one by one, and every real source would later have to be translated into all of them.

For most of this information a standard exists, sometimes several, and they do not represent it equally well: OpenStreetMap's opening hours hold public and school holidays, the nth weekday of a month or sunrise, which schema.org's opening hours cannot. A rich standard often needs a library to be read, and a domain that could import nothing but its stream library pushed toward rewriting part of the standard in the project's own code.

Which shape should external data take, and who reads a standard?

## Decision Drivers

- A real source plugs into the app through its adapter, without the domain changing.
- The shape represents the information without losing what the source holds.
- A standard is read by the code that implements it, never by a partial copy of ours.
- The rules that use the data stay in the domain and in its scenarios.

## Considered Options

- A standard chosen in a fixed order of preference, read by a library that implements it
- International standards first, OpenStreetMap's tagging second
- Shapes of our own, with the rules written in the domain without a library
- A library of a standard behind a port, in an adapter

## Decision Outcome

Chosen option: « A standard chosen in a fixed order of preference, read by a library that implements it », because the order puts the quality of the representation first, and a library keeps the standard whole while its rules stay in the domain.

### A fixed order of preference

The shape of a piece of external data is chosen from standards, in this order: the standard that represents the information best, with the fewest known defects; otherwise an international standard; otherwise OpenStreetMap's tagging; and only then anything else. Where no standard exists, the shape proposed stays as close as possible to a real one. The order, not the habit of one change, settles each choice, and the choice names the standards set aside.

### The standards in use

Places are described after OpenStreetMap's tags, their opening hours in OpenStreetMap's opening hours format, their addresses in the components of ISO 19160-4 and schema.org's postal address, with an ISO 3166-1 country, and the time zone of an area as an IANA time zone. The departures of a station follow SIRI, outlines and features are GeoJSON, and a street-view picture is a STAC item. These are the current results of the order, not part of the rule: a better standard for a piece of information replaces the one in use.

### Our own grouping only where no standard exists

Where no standard holds the information, the project defines its own vocabulary over standard values, and says so: categories of places are a grouping of our own over kinds read from OpenStreetMap's tags, because no standard names such categories. A vocabulary of our own never replaces a standard that exists.

### A library implements the standard, never our code

A standard that needs code to be read is read by a maintained library that implements it, not by a rewriting of ours, even a partial one. Such a library may be used in the domain, so that the rules built on the standard stay there with their scenarios; which libraries the domain may import is enforced as [0007](0007-imports-bounded-by-dependency-cruiser.md) sets.

### Consequences

- Good, because a real source tagged after the same standards is read by its adapter, without new shapes in the domain.
- Good, because the shapes keep what the standards hold, such as public holidays in opening hours.
- Good, because no rule of a standard is maintained by the project: the library's tests and upkeep carry it.
- Bad, because choosing the best standard is a judgement no tool checks: review carries it.
- Bad, because a library in a domain is a dependency the domain's tests run against: its licence, its weight and its upkeep are weighed when it enters.
- Neutral, because standards of different origins live side by side, each in the part of the domain that uses it.

## Pros and Cons of the Options

### International standards first, OpenStreetMap's tagging second

The first rule written for the project. It was set aside on opening hours, where OpenStreetMap's format holds what schema.org's cannot: putting the international standard first would have made the app lose information.

### Shapes of our own, with the rules written in the domain without a library

No dependency, and shapes cut to what the screen shows. But each standard would be rewritten in part by the project, then translated to and from the real one when a source lands.

### A library of a standard behind a port, in an adapter

The domain would stay free of packages. But its rules, such as whether a place is open now, would move out of the domain and out of its scenarios, into an adapter that is not tested by them.

## More Information

### Where to find the detail

- [The abilities of the places, which read OpenStreetMap's tags, opening hours, SIRI departures and STAC pictures](../../src/features/places/abilities/)
- [The abilities of the search, which read addresses, districts and categories](../../src/features/search/abilities/)
- [The packages a domain may import](../../.dependency-cruiser/shared.ts)

### References

- [0002: A static client app, reading map data from outside behind ports](0002-a-static-client-app-reading-map-data-from-outside-behind-ports.md)
- [0007: Imports bounded by dependency-cruiser, with exceptions written per target](0007-imports-bounded-by-dependency-cruiser.md)
- [OpenStreetMap's map features](https://wiki.openstreetmap.org/wiki/Map_features)
- [OpenStreetMap's opening hours](https://wiki.openstreetmap.org/wiki/Key:opening_hours)
- [schema.org PostalAddress](https://schema.org/PostalAddress)
- [ISO 19160-4](https://www.iso.org/standard/64242.html)
- [ISO 3166-1](https://www.iso.org/iso-3166-country-codes.html)
- [IANA time zone database](https://www.iana.org/time-zones)
- [SIRI](https://www.siri-cen.eu/)
- [RFC 7946, GeoJSON](https://www.rfc-editor.org/rfc/rfc7946)
- [STAC](https://stacspec.org/)

### History

- 2026-11-28, marc-gavanier: first writing.
