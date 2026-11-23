# ADR-054 — Reaching a place, after OpenStreetMap's contact keys

**Date**: 2026-11-22
**Status**: accepted

## Context

The sheet of a place ([ADR-049](ADR-049-the-sheet-of-a-place-and-addresses-in-components.md)) tells what a place is and where, not how to reach it. The previous app had a Call and a Website button under the header of the sheet, and its details gave the phone, the website and the menu. Its measures were read in its code and are listed in issue #70, with the product owner's decisions: Directions and Save stay hidden until their lots, the remaining buttons share the whole width, and Instagram and Facebook get one line each in the details, which the previous app did not have.

The places need a phone, a website, a menu, an Instagram account and a Facebook page. [ADR-043](ADR-043-standards-first-and-their-libraries-in-the-domain.md) asks for their shape to come from a standard.

## Decision

- **OpenStreetMap's keys**: `phone`, `website`, `website:menu`, `contact:instagram` and `contact:facebook`, read into `phone`, `website`, `menu`, `instagram` and `facebook`, as ADR-049 read `addr:housenumber` into `houseNumber`. Each is text: the phone as written, the others a link. They stand beside the other fields of a place in `open-place`, its adapter and the fake places.
- **The sheet writes them, it does not rewrite them**: presenters of `open-place` give the `tel:` link without spaces, the name of a website without a leading `www.`, the `@account` of Instagram and the page of Facebook from the first part of their path. A link that does not start with `http://` or `https://` gets `https://`, and one with a `javascript:`, `data:`, `vbscript:`, `file:` or `blob:` scheme becomes `#`, so that a value of the data never runs a script.
- **The row of action buttons marks where the sheet peeks down to** on a phone; without Call nor Website, the row of the button that copies the address keeps marking it, as before, which the product owner chose on 2026-11-22.
- **The fake places** get their ways to be reached from a Faker of their own, with its own seed, so that the other fields of the generated places stay as they were. Famous places get theirs by hand. Every link points to a `.example` host ([RFC 2606](https://www.rfc-editor.org/rfc/rfc2606)), every phone to `+33 1 99 00 …`, a range believed to be kept for fiction.

## Consequences

- A real source tagged after OpenStreetMap is read without translation; one that holds an Instagram name rather than a link, as OpenStreetMap also allows, still shows `@account`.
- Facebook shows the name of the page as its link writes it, not as the page titles itself: no standard carries that title.
- The places file grows with these fields, read by the map at start-up too.

## Alternatives considered

- **schema.org's `telephone`, `url`, `hasMenu` and `sameAs`**: an international vocabulary, but `sameAs` lists every profile of a place without saying which network each one is, so the sheet would guess Instagram and Facebook from their hosts, and `hasMenu` belongs to food establishments only.
- **One `contact` object** grouping the five fields: tidier, but further from OpenStreetMap's flat keys and from the other fields of a place.
- **Real-looking fake numbers**: they could ring a real line; the range kept for fiction avoids that, if it is the one believed.
