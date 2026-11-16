# ADR-036 — Search by type: one vocabulary of kinds, the nearest places, and chips

**Date**: 2026-11-16
**Status**: accepted

## Context

The previous app let the visitor find the nearest places of a kind in two ways. Typing a kind ("pharmacie", "resto près de moi") offered a row "Pharmacies près de vous" at the top of the results; choosing it, or pressing one of the chips under the search field ("Restaurants", "Cafés", "Pharmacies"…), opened a sheet that listed the places of that kind around the centre of the map and marked them on it. It recognised kinds with two overlapping vocabularies: the words of its 51 categories (`categories.js`, with filler words such as "près", "moi", "proche") and those of `searchintent.js`, plus a third table loaded on demand from the presets of the iD editor. Its search of a type, `byIntent`, took the nearest places of that type within a box of about ±3.5 km around the centre of the map.

The fake Paris has 26 kinds of places ([ADR-028](ADR-028-a-fake-paris-generated-at-build-time.md)), and `search-places` searches them by name only ([ADR-030](ADR-030-search-by-name-with-minisearch-and-our-own-ranking.md)). Abilities never import each other and meet in routes ([ADR-006](ADR-006-features-and-abilities-on-a-hexagonal-core.md), [ADR-008](ADR-008-composition-in-routes.md)); the search panel hosts what other abilities offer ([ADR-033](ADR-033-recent-searches-kept-on-the-device.md)). The map pages are over their script budget ([ADR-022](ADR-022-lighthouse-budgets-per-page.md)).

## Decision

- **A new ability, `search/search-by-type`.** Its domain holds the vocabulary and two stream functions ([ADR-007](ADR-007-abilities-are-rxjs-stream-functions.md)): `namedKind`, from the visitor's query to the kind it names, if any, and `searchByType`, from the kinds chosen and the view of the map to the places listed.
- **One vocabulary, as data.** `domain/kind-words.json` lists, for each of the 26 kinds, the phrases that name it in English and in French, singular and plural written out ("bakery", "bakeries", "boulangerie", "boulangeries", "pâtisserie"…; "hôpital", "hôpitaux"; "bureau de poste", "bureaux de poste"), and the filler words of both languages ("near", "me", "the nearest", "près", "de", "moi", "la plus proche", "chez"…). A query names a kind when, accents and case folded as for names, and filler words dropped, what remains is one of its phrases: "Pharmacie la plus proche", "bakeries near me" and "l'hôpital" name a kind; "boulangerie garcia" and "bar restaurant" do not, and stay searches by name. A test checks that every phrase names its own kind and no other.
- **The nearest 25 within 3.5 km.** The places of the kind chosen are taken within 3.5 km of the centre of the map, the nearest first, 25 at most: the previous app's distance, measured as a circle rather than its box. On the fake Paris, from its centre, that gives 25 bakeries, 25 pharmacies, 11 museums and 2 hospitals; elsewhere the visitor is told that no such place is near and invited to move the map. The list is computed from the centre of the map at the moment of the choice, and is not refreshed when the map moves, since fitting the map to the places moves it.
- **Sharing the search field.** `search-places` takes a second hosted snippet, `lead`, rendered at the top of its panel whenever the panel is open, whatever is searched. The route puts the row "Bakeries near you" there while the query names a kind, above the places found by name, as the previous app did. Choosing the row clears the field, closes the panel and lists the places of the kind.
- **Chips and the list of a kind.** Under the search field, a list of toggle buttons (`aria-pressed`) with a dot of the kind's colour offers seven main kinds: restaurants, cafés, bakeries, pharmacies, supermarkets, bars and museums. They scroll sideways on a phone and wrap from 700 px. Pressing one lists its places in a card under the chips, headed by the kind, with a close button, Escape, and a polite status that says how many are found; pressing it again closes the list. Each place is a button built on the design library's `suggestion`. Choosing one closes the list, gives the focus back to its chip, flies to the place and keeps it among the recent searches, as a search result. The search panel overlays the chips instead of pushing them down: the route places the field and the chips in the same grid cell.
- **Pins on the map.** An overlay marks each place listed with a dot of its kind's colour and fits the map to them, at zoom 16 at most, leaving room for the card: on its left from 700 px, at the top on a phone.
- **The same places, fetched once.** The `prerendered` adapter of `LoadPlaces` moves up to the feature, with the `LoadPlaces` port, the distance and the folding of text, since both abilities use them. It fetches `places.json` once per visit, whichever ability asks first, and again after a failure.
- **Loaded on first use.** The vocabulary and its matcher are loaded with a dynamic `import()` when the search field first gets the focus, and the code that draws the pins when the first list is shown. The chips, prerendered with the page, stay in the initial scripts.

## Measures

The scripts loaded by the home page, as served compressed by `vite preview` and without the MapLibre worker, went from 357,771 to 360,321 bytes (+2.5 kB) on 2026-11-16; Lighthouse counts 367,408 bytes against a budget of 360,000, which was already exceeded before this change. The vocabulary chunk adds 1.2 kB with gzip on the first focus of the field. The chips stay disabled until the page's scripts start, as the search field does, so that no press is lost.

## Consequences

- A kind is recognised only when it is spelt in full: "boulang" and "pharmaci" stay searches by name. A misspelt kind ("boulangeri") is not recognised, though the search by name often finds places of that kind.
- "Pizza" and "pizzeria" name restaurants, and "urgences" hospitals: the fake Paris has neither cuisines nor emergency departments.
- Opening hours, diets, "what + where" ("boulangerie 11e"), the previous app's customised chips and its other categories (cash machines, banks, petrol stations…) are left out until the places carry them.

## Alternatives considered

- **A plural rule** (drop a final "s" or "x", "-ies" to "-y"): shorter data, but "pharmacies" and "boulangeries" need different rules in each language, and the rule hides what is recognised. Writing the plurals out keeps the vocabulary readable and tested phrase by phrase.
- **Typo tolerance on kinds**, through the search by name's rules: a misspelt kind would compete with names, and the search by name already finds most of them.
- **The places of a kind as options of the combobox**: its listbox would mix two abilities, and `search-places` would have to know about kinds, as ADR-033 set aside for recent searches.
- **The list in the search panel itself**: the panel closes as soon as the focus leaves the field, and a chip is outside it; the list would vanish when the visitor pans the map.
- **A bottom sheet**, as in the previous app: a component the design library does not have yet; the card under the chips reuses the panel's look.
- **Refreshing the list as the map moves**: fitting the map to the places would trigger a new search at once, and the list would change under the visitor's finger.
