---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# Search in the browser, with an index library as an adapter and the rules in the domain

## Context and Problem Statement

The app is a static site without a server ([0002](0002-a-static-client-app-reading-map-data-from-outside-behind-ports.md)): searching places, addresses and categories happens in the browser, on data fetched on demand ([0022](0022-what-the-first-view-does-not-need-loaded-on-demand.md)). The previous app ranked its results with rules tuned query after query against a reference list of searches: typos counted with swapped letters as one, the beginning of the last word, the quality of each match, fame, distance to the centre of the map. Its index was a hand-written scan of the whole vocabulary, inside one module that held every rule.

Several abilities take part in one search field: places by name, addresses, categories, recent searches. Abilities never import each other ([0006](0006-features-and-abilities-on-a-hexagonal-core.md)), and only entry points compose them ([0010](0010-only-entry-points-compose.md)).

How should the search be built, so that its rules can be read, tested and tuned without the library that indexes the words, and so that each kind of result stays its own ability?

## Decision Drivers

- Ranking rules are business rules: they live in a domain, where scenarios play them.
- A real source of places or a real geocoder replaces an adapter, never a rule.
- The index finds candidates fast and prunes what is too far, without deciding what matches.
- An ability that adds results to the field does not change the ability that owns the field.

## Considered Options

- An index library behind an adapter, with the matching, ranking and vocabularies in the domain, and finders composed by the entry point
- A port of the previous app's hand-written index
- A search library's own full-text scoring: MiniSearch, Fuse.js or FlexSearch
- One combobox that knows every kind of result

## Decision Outcome

Chosen option: « An index library behind an adapter, with the matching, ranking and vocabularies in the domain, and finders composed by the entry point », because it keeps every rule in pure functions that the scenarios play, and lets each kind of result join the field as its own ability.

### The index library is an adapter

MiniSearch's radix tree, with its bounded edit-distance search and its prefix search, supplies the candidate words of the names, behind a port of the domain. It is loaded with the data when the search field first gets the focus. Nothing of its own scoring is used.

### Matching and ranking are pure functions of the domain

Folding, typo counting, the quality of a match and the ranking of results are pure functions, shared by the abilities of the search feature. The domain asks the index for candidates and keeps only those its own rules accept.

### Vocabularies are data

The words that name a category, the filler words, the kinds of streets and their abbreviations are data files of the domain, written out rather than derived by a rule of plurals, and tested phrase by phrase.

### Finders compose; the field knows one model of result

An ability that adds results to the field, such as addresses, wraps the finders of the search by plain function application in the entry point. The field knows only the shared model of a result, never which ability produced it, and the mixing of kinds is a rule of a domain, not of the entry point.

### Other content of the panel comes through slots

What is not a result of the listbox, such as the recent searches or the row that offers a category, is given to the search panel through slots filled by the entry point. The listbox holds results only, as the combobox pattern of WAI-ARIA asks.

### Consequences

- Good, because the rules can be read, tested and tuned without the index library, and a real source changes an adapter, not them.
- Good, because a new kind of result is a new ability, composed in the entry point, without touching the field.
- Good, because the vocabularies can be read and extended without reading code.
- Bad, because the domain counts typos again on every candidate the index returns, which costs more than letting the library score.
- Bad, because written-out vocabularies are long, and each phrase must be added in every language.
- Neutral, because the index and the data load on the first focus of the field, so the first search waits for them.

## Pros and Cons of the Options

### A port of the previous app's hand-written index

No dependency, and as fast on the fake data. It scans the whole vocabulary at each query, a cost that grows with the data, where a tree prunes the words too far from the query.

### A search library's own full-text scoring: MiniSearch, Fuse.js or FlexSearch

Ready-made fuzzy search and ranking. Each library's score sits between the words found and our rules, and ranks by text only: a famous place lost behind its namesakes, swapped letters counted as two typos, or typos the previous app found missed.

### One combobox that knows every kind of result

Arrow keys would reach every row. The ability that owns the field would know about addresses, categories and recent searches, and its options would mix several abilities that could no longer change apart.

## More Information

### Where to find the detail

- [The scenarios of the search abilities](../../src/features/search/abilities/)
- [The rules shared by the search abilities](../../src/features/search/domain/)

### References

- [MiniSearch](https://lucaong.github.io/minisearch/)
- [The combobox pattern of WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [Optimal string alignment distance](https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance#Optimal_string_alignment_distance)

### History

- 2026-11-28, marc-gavanier: first writing.
