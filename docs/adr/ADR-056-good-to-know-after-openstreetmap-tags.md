# ADR-056 — Good to know, after OpenStreetMap's tags

**Date**: 2026-11-23
**Status**: accepted

## Context

The sheet of a place tells what it is, where, and how to reach it ([ADR-049](ADR-049-the-sheet-of-a-place-and-addresses-in-components.md), [ADR-054](ADR-054-reaching-a-place-after-openstreetmap-contact-keys.md)), not whether it takes cards, has a terrace or lets dogs in. The previous app listed such facts in a « Bon à savoir » section. Its rules, labels and measures were read in its code and are listed in issue #75, with the product owner's decisions: the labels and their order are the previous app's, only the first fact of a group that excludes one another shows, four facts get a red cross and every other one a green tick, nothing is deduced, wheelchair access belongs to the strip of a later step, and the section stands above the details.

The facts come from about twenty-five keys and their values. [ADR-043](ADR-043-standards-first-and-their-libraries-in-the-domain.md) asks for their shape to come from a standard.

## Decision

- **OpenStreetMap's tags, as they are written**: a place carries `tags`, an object whose keys and values are OpenStreetMap's (`payment:contactless`, `outdoor_seating`, `diet:vegan`, `reservation`, `dog`…). Unlike the five keys of ADR-054, they are not renamed: there are too many, their colons group them, and their values (`yes`, `only`, `designated`, `leashed`, `required`…) are a vocabulary of their own that a renaming would have to rewrite.
- **The rules stand in the domain of `open-place`**: `goodToKnowOf` reads the tags into an ordered list of facts, each with its sign, `yes` or `no`. Only the four facts that warn the visitor (cards refused, cash refused, reservation required, dogs not allowed) are `no`. Its Gherkin scenarios state every rule.
- **The sheet writes them, it does not decide them**: a presenter turns each fact into its message, and the component draws the tick or the cross; every label is a message, which the previous app mostly was not.
- **The adapter keeps the tags written as text** and leaves out any other value.
- **The fake places** get their tags from a Faker of their own, with its own seed, so that the other fields of the generated places stay as they were, after tables of plausible tags by kind of place: a terrace for a café, a reservation for a hairdresser, nothing for a school. Famous places get theirs by hand, and stations none.

## Consequences

- A real source tagged after OpenStreetMap is read without translation, and the next steps can read other tags (wheelchair access, opening hours) from the same object.
- The names of the keys are spelled in the code as OpenStreetMap spells them; they are written as text, never as names of properties, which Biome's naming rule would refuse.
- The places file grows with these tags, read by the map at start-up too: 92.7 kB gzipped before, measured in the pull request after.

## Alternatives considered

- **schema.org's `amenityFeature`, `paymentAccepted` and `acceptsReservations`**: an international vocabulary, but it has no term for a terrace, a changing table, dogs, meal vouchers or a historic monument, and `amenityFeature` is a list of free names, so most facts would still need names of our own.
- **One renamed field per key**, as ADR-054 did for five keys: about twenty-five fields, each with a value that still follows OpenStreetMap's vocabulary, so a half translation.
- **A list of facts already decided in the data**: lighter for the sheet, but the rules would then live in the fake data, where a real source could not follow them.
