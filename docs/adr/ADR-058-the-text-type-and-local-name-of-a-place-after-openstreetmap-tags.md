# ADR-058 — The text, the precise type and the local name of a place, after OpenStreetMap's tags

**Date**: 2026-11-24
**Status**: accepted

## Context

The sheet of a place tells what it is, where, how to reach it and what is good to know ([ADR-049](ADR-049-the-sheet-of-a-place-and-addresses-in-components.md), [ADR-054](ADR-054-reaching-a-place-after-openstreetmap-contact-keys.md), [ADR-056](ADR-056-good-to-know-after-openstreetmap-tags.md)). The previous app also told about the place in a few lines, named it more precisely than its kind (« Cathédrale » rather than « Lieu de culte »), gave its local name when it was not the name shown, and ordered its sections after the place: the text last for a place expected to have opening hours, first for any other. What is asked is listed in issue #80, with the product owner's decisions: fake texts in French and English on the famous places, no link to Wikipedia while the data are fake, precise types on the famous places only, the name shown stays French.

Of the previous app's precise types, only the labels and one case are known: a church that became a place to visit, the Panthéon, is a « Monument ». Its rules from the data to these labels are not available.

[ADR-043](ADR-043-standards-first-and-their-libraries-in-the-domain.md) asks for the shape of these data to come from a standard.

## Decision

- **OpenStreetMap's tags, as they are written**, in the `tags` of a place, as ADR-056 decided:
  - the text is `description:<language>`, one tag per language of the app, and the sheet reads the one of the visitor's language; a place without a text in that language shows none;
  - the local name is `name`, which OpenStreetMap keeps for the name used on the spot; the sheet shows it only when it differs from the name of the place;
  - the precise type is read from the tags that tell what a place is: `amenity`, `building`, `historic`, `castle_type`, `man_made`, `tourism` and `leisure`.
- **The rules of the precise type are rebuilt, not copied.** `preciseTypeOf`, in the domain of `open-place`, holds an ordered list of rules, and the first that applies wins. It holds the thirteen types the famous places need: a cathedral, a basilica, a chapel and a church only where people worship (`amenity=place_of_worship`), then a monument, a palace, a tower, a museum, a cultural centre, a theatre, a library, a garden and a park. A church building where nobody worships and which is a `historic=monument` is therefore a monument, the one case known. A place whose tags tell no precise type keeps the type of its kind.
- **A place expected to have opening hours** is told by `expectsHours`, in the domain, from its kind: the previous app's list, written with the kinds this app has. The sheet sets the text after what is good to know and the details for such a place, and before them for any other, a station included.
- **A text longer than 180 characters is cut at four lines**, with a button that shows it whole in place; nothing folds it back. A shorter text is never cut, whatever the width of the sheet, since nothing would open it.
- **The fake texts** of twenty-two famous places are written by hand, in a file per language beside the landmarks, which the fake places read into these tags. They are not taken from Wikipedia, and the sheet links to no source.

## Consequences

- A real source tagged after OpenStreetMap is read without translation.
- The kind of a place and its tags can disagree; the tags win in the sheet, and the search keeps naming a place after its kind until the shape of types is settled with the categories.
- Other precise types of the previous app come with their rules when a place needs them; each rule is a line of the list and a scenario.
- Step 13 reads `expectsHours` to tell that opening hours are not known yet.
- The places file grows with the texts, read by the map at start-up too; the pull request measures it. Should the weight policy ask for it, the texts move to a file of their own, loaded when a sheet opens.

## Alternatives considered

- **The texts in a file of their own, loaded when a sheet opens**: nothing more to load at start-up, but one more file, port and adapter for about twenty texts; kept as the way out if the places file must shrink.
- **A `description` field per place with one object per language**, or schema.org's `description`: neither says how to carry several languages, which OpenStreetMap's suffix does.
- **Wikidata's or Wikipedia's reference (`wikidata`, `wikipedia`) and the text fetched from there**: the real thing, but an external service, which the app does not call.
- **One more kind per precise type**: the kinds are the vocabulary of the search and of the dots; a cathedral would then no longer be found among the places of worship.
- **Cutting every text at four lines**, as the previous app did: a text under 180 characters that takes more than four lines on a narrow screen would lose its end with no way to read it.
