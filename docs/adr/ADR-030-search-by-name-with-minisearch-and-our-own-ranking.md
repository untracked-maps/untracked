# ADR-030 — Search by name with MiniSearch and our own ranking

**Date**: 2026-11-16
**Status**: accepted

## Context

The previous app searched places on the phone, in an index it downloaded, with rules tuned query after query against a reference list of Paris searches: every word typed must match, the last one by its beginning, with one typo from four letters and two from eight; then a score of text quality and word coverage, a bonus when the name starts with the query, Wikidata fame, a bonus or a malus by type, and a penalty for the distance to the centre of the map that fame excuses for landmarks only; "strong" matches first. Its index was a hand-written scan of every word of the vocabulary with a Damerau edit distance, inside a 500-line module with the rest of the search.

The rebuilt `search-places` ability searches the fake Paris ([ADR-028](ADR-028-a-fake-paris-generated-at-build-time.md)) by name only, and keeps those rules.

## Decision

- **MiniSearch finds the candidate words.** Its `SearchableMap`, a radix tree with a bounded Levenshtein search (`fuzzyGet`) and a prefix search (`atPrefix`), holds every word of every name, accents and case folded, elisions glued as well ("d orsay" also gives "dorsay"). A second tree holds the beginnings of those words, from four letters, for a last word misspelt before it is finished ("triomf" for "triomphe"). MiniSearch 7.2.0 is under the MIT licence, has no dependency, and is loaded with the index, only once the search field gets the focus.
- **Our rules decide, as pure functions of the domain**, tested one by one: `words` folds and splits the text and drops stop words, `typos` counts typos as the optimal string alignment distance, where two swapped letters are one typo, and stops counting past three, `word-matches` turns each word found into a quality (1 exact, 0.85 down to 0.7 for a beginning, 0.72 for one typo, 0.6 for a misspelt beginning, 0.55 for two typos), and `ranking` scores and orders the places with the previous app's weights. The domain asks the index for words twice as many edits away as the typos it allows, since a swap is two edits for Levenshtein, then keeps only those within its own count.
- **The use case** (`search-places`) waits 250 ms after the last keystroke, searches from two characters, drops a search the visitor typed over (`switchMap`), keeps at most seven places, and ranks them from the centre of the map. Choosing a place emits it to the route, which passes it to the map as an overlay that flies there, at zoom 16.5 or closer, and marks it ([ADR-024](ADR-024-locate-me-with-fake-positions-before-the-geolocation-api.md)).
- **The field follows the WAI-ARIA combobox pattern** with a listbox: `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-selected`, arrow keys that wrap, Enter, Escape that closes then clears, and a polite status that says how many places are found. Its styling stays minimal, made of system colours, until the design library restyles it. A native `<select>` cannot be the popup of a text field, so html-validate's `prefer-native-element` rule lets the `listbox` role through. The field is prerendered with the page, so that it paints with it: loaded after the map's scripts, its placeholder became the largest contentful paint of `/fr`, at 4.1 s. It stays disabled until the page's scripts start, so that nothing typed before is lost.

## Measures

The acceptance queries of `acceptance.spec.ts` adapt to the fake Paris the Paris queries of the previous app's reference list that search a name: landmarks typed in full, without accents, with typos ("tour eifel", "grnd palai", "musee dorsay", "panteon", "elisée"), swapped letters ("tuor eiffel", "lovure"), beginnings ("tour eif", "sacre"), misspelt beginnings ("arc de triomf", "orsé") and namesakes ("parking tour eiffel", "elysee beaute"). Measured on 2026-11-16 on 60 queries, from the centre of Paris, with each library's own ranking for the others:

| Index                                      | Top-1 accuracy | Per query | Build | Code, gzip |
| ------------------------------------------ | -------------- | --------- | ----- | ---------- |
| MiniSearch's `SearchableMap` and our rules | 60/60 (100 %)  | 0.4 ms    | 8 ms  | 3.3 kB¹    |
| A port of the previous app's index         | 59/60 (98 %)   | 0.4 ms    | 6 ms  | —          |
| Fuse.js 7.5.0                              | 52/60 (87 %)   | 7.5 ms    | 3 ms  | 9.1 kB     |
| MiniSearch 7.2.0 alone, fuzzy 0.2, prefix  | 50/60 (83 %)   | 0.2 ms    | 9 ms  | 18 kB²     |
| FlexSearch 0.8.212, forward, LatinBalance  | 50/60 (83 %)   | 0.02 ms   | 11 ms | 4.5 kB     |

¹ The whole index chunk of the build, our rules included (7.8 kB before compression); the page loads it with the places, when the search field first gets the focus, so it adds nothing to the page's initial scripts. ² The unminified ES module.

The libraries alone miss the famous place behind its namesakes ("élysée" gives the beauty salon, "orsay" the florist), since they rank by text only. The previous app's index misses "arc de triomf": its scan skips words whose length differs by more than the typos allowed before trying the misspelt beginning. These queries are kept as tests: each one must find its place first.

## Consequences

- The rules can be read, tested and tuned without MiniSearch; a real source of places will change the adapter, not them.
- The domain's typo count is computed again on every candidate word, and a short last word asks for many beginnings: under half a millisecond per query on 2,000 places, to be measured again on a real index.
- Left out from the previous app, each for its own ability: addresses and streets, categories ("boulangerie"), "what + where", brands, opening hours, recent searches, saved places, alternative names and abbreviations ("st" for "saint"), Photon and the national directory.

## Alternatives considered

- **A port of the previous app's index**: no dependency and as fast, but a hand-written scan of the whole vocabulary that grows with it, where MiniSearch's tree prunes the words beyond the distance asked.
- **MiniSearch's full-text search with a custom score**: its BM25 score and its own fuzzy weights would sit between the words found and our rules, and its fuzzy search does not count swapped letters as one typo.
- **Fuse.js**: a Bitmap score over the whole name, more than ten times slower here, with no notion of words.
- **FlexSearch**: the fastest, but its encoders and its contextual index decide what matches, and it missed typos the previous app found.
