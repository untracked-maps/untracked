# ADR-068 — Categories of places gather kinds

**Date**: 2026-11-25
**Status**: accepted

## Context

The former app offered 60 categories of places in 8 groups, from Restaurants to Hôtels. Its row under the search field showed 5 of them: Mes lieux, Restaurants, Cafés, Métro and Pharmacies. Typing a word of a category offered its places near the visitor. The rebuilt app knew 26 kinds of places and searched by kind ([ADR-036](ADR-036-search-by-type-one-vocabulary-the-nearest-places-and-chips.md)): seven chips, a vocabulary of phrases, one kind per list.

A category is not a kind. « Parcs et jardins » gathers parks and gardens, « Monuments » monuments and tourist attractions. 37 categories had no place at all in the fake Paris. Step 21 of the rebuild plan (#46, #106) brings the categories in. The product owner settled its scope in #106 on 2026-11-25:

- the "+" button comes with step 24, with the editor it opens;
- Mes lieux waits for its lot, and the Métro chip for step 25;
- each new category gets 6 fake places;
- the row loses the chips of bakeries, supermarkets, bars and museums.

## Decision

- **A category is a key of our own naming that gathers one place kind or more.** The categories are listed in the former app's order, and each key gives its kinds. Kinds stay our names after OpenStreetMap's tags ([ADR-043](ADR-043-standards-first-and-their-libraries-in-the-domain.md)). No standard names such categories: the former app's are a product choice. The list of a category holds the nearest places of each of its kinds.
- **59 categories for now.** Mes lieux, the 60th, comes with lot F. The 8 groups come with step 24, the only screen that shows them.
- **The row shows Restaurants, Cafés and Pharmacies**, in the former app's order. Mes lieux and Métro join it at their steps. The names of the categories are the former app's, word for word. Their colours are the former app's own colours where it had one, and its family's otherwise.
- **The chips follow the former app's measures.** Each chip is 32 px high, with a padding of 10 px on the left and 12 px on the right, and 7 px between its dot and its name. The name is 14 px, weight 500. The chip has a two-layer shadow. A chip shown takes the category's colour mixed with 24 % black, with white text. On a phone, and up to 899 px, the row fades out on its last 32 px.
- **A category is named by its words, word by word, as in the former app.** Every word typed must be a word of the category or a filler word, and at least one must be a word of the category. The first category in the former app's order that holds them is offered. So « station » offers Métro, and « station service » offers Stations-service. The vocabulary is one JSON file of phrases, cut into words when it loads. A filler word, such as « shop » or « magasin », names no category. The former app first looked at the chips in their chosen order; with the chips fixed, that order cannot be observed, and it comes with step 24.
- **The 37 missing kinds get 6 fake places each, drawn with seeds of their own**, after the 2,000 drawn places, so that no existing place moves. They take the map families of the former app: food, shop, money, fuel, health, culture, nature. Kinds that the former app showed as a grey dot get no family.

## Consequences

- The places file grows by 222 places, from 99.53 kB to 108.56 kB as size-limit measures it, under the 120 kB of [ADR-063](ADR-063-a-weight-budget-for-the-places-file.md). The rest of the app grows from 181.57 kB to 186.06 kB, mostly with the names of the categories and kinds, in two languages.
- Schools belong to no category of the former app: typing « école » no longer offers a list. A school is still found by its name.
- The kinds of a category are tested one by one, so that a kind moved by mistake fails a test.
- Active La Poste would have white text at 4.39:1 on its darkened yellow, below WCAG AA. It cannot be a chip before step 24, which must give it another text colour.
- The 18 pictograms of the categories wait for step 26: no screen of step 21 shows them, and their drawings are not in the archive given to this step.
- [ADR-036](ADR-036-search-by-type-one-vocabulary-the-nearest-places-and-chips.md) stands for loading on demand, the list and the radius. Its vocabulary of kinds and its seven chips are replaced.

## Alternatives considered

- **One kind per category**: a category of two kinds, such as parks and gardens, would need a new kind, and the landmarks would lose the kind the sheet names.
- **Matching whole phrases, as before**: « station service » would need its own phrase, and every new phrase could shadow another. Word by word is the former app's rule, and the tests check that every phrase names its own category.
- **Drawing the new places among the 2,000**: every existing place would move, with the tests and the measures that name them.
- **12 places per category**: about 19.5 kB, at the cap, with nothing left for the next steps.
