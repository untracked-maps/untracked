# ADR-055 — Sharing a place or a spot by a link

**Date**: 2026-11-22
**Status**: accepted

## Context

In the previous app, any place, and any spot touched on the map, could be sent by a link that opened it again. Its link was `#carte=17/latitude/longitude&lieu=<identifier>` for a place and `&point=1` for a spot, with 5 decimals, always at zoom 17, without bearing or tilt. It gave the phone's share sheet a text as well as the link, so that "Copy" on an iPhone copied the name instead of the link. It opened a place it could not find with an empty title and its sentence at the very bottom of the sheet. Closing a sheet opened by a link left the place in the address, and a link without a view opened the default view.

The view lives in the hash as `#map=zoom/latitude/longitude`, read as `key=value` pairs, so that other abilities can add their own keys ([ADR-025](ADR-025-the-view-in-the-url-hash.md)). Issue #56 asks for the button, the link and the case of a place that cannot be found. The product owner decided on 2026-11-22: the link alone in the share sheet; a copy where there is none; nothing when the share is cancelled; a notice when the copy fails; the Share button on a spot placed by hand too; « Lieu introuvable » as the title, its sentence just below, a red pin at the link's point; no search for the visitor's position when a link opens; the two defects above fixed. Later the same day, the product owner removed the « Lien copié » notice the issue asked for: Android shows its own confirmation and the reference apps show none.

The home page stood at 199 of its 200 lines and its loader at 196, and a route cannot import another file of `src/routes` ([ADR-053](ADR-053-framing-the-map-on-what-is-opened-measured.md)).

## Decision

- **The keys**: `place=<identifier>` for a place and `point=1` for a spot, after ADR-025's `map`. The identifier is escaped as a URL component. A link is `#map=17/latitude/longitude&place=<identifier>`, or `&point=1`, and nothing else.
- **Zoom 17, whatever the zoom on screen, with ADR-025's decimals**: `ceil(log10(2^17 × 1024 / 360))`, that is 6, not the 5 of the previous app. Where the two disagree, ADR-025 prevails. The link keeps the address of the page and replaces its hash.
- **`keep-view-in-url` owns the format**, as it owns the view: `linkOfFragment` and `linkTo` in its domain, and `followed-link`, the link the URL asks for, the place or the spot it opens, and whether the URL keeps it.
- **The URL keeps the link as long as the sheet it opened stays open.** It writes no view meanwhile, so that a reload opens the same place or the same spot; once that sheet closes, the view is written again without the key. A sheet opened otherwise never writes its place in the address, as before.
- **A new ability, `share-link`, in `places`.** Its use case gives the share sheet the title of the sheet and the link (`navigator.share({ title, url })`, no text). Without a share sheet, or when it fails for any reason other than the visitor closing it, the link is copied. A refused copy says « Le lien n'a pas pu être copié »; a share, a cancelled share and a successful copy say nothing.
- **Opening a link**: the map opens on the link's view (ADR-025). A place opens its sheet, which the map frames as any opened place (ADR-053). A spot opens as a long press does, red pin then address, and the map does not move. Nothing looks for the visitor's position. A link to a place without a view opens its sheet, and the framing takes the map there from the default view.
- **A place that cannot be found** is a sheet of its own in `open-place`, `missing`, for an opening that comes from a link: titled « Lieu introuvable », with the sentence of the message `place_missing_why` just below, saying it may have closed or the link may be incomplete, and the red pin of `open-place` at the link's point.
- **The Share button** is a round button of 32 px in the `design` library, its icon 17 px, at the top left of the sheet, level with the close button and mirroring it: 14 px from the edge on the sheet of a place, with a touch area 6 px wider on every side, as the close button there. On the sheet of a spot, whose close button stands 16 px from the edge (step 9), it stands at 16 px; the product owner confirmed it. The close button and the Share button share one `round-button`.
- **The home page keeps within its 200 lines** by moving out code that was already there and belongs elsewhere, as the product owner chose: the notice board to `notices` (`notice-board`), the helper that fetches a file once to a new library, `fetched-once`, and two declarations of the page merged into one.

## Consequences

- A link pasted into a tab where the app is already open is still followed only after a reload, as ADR-025 states. The previous app followed it at once. **This point waits for Marc.**
- A link to a place opens « Lieu introuvable » also when the places cannot be loaded.
- Links of the previous app, under `#carte=` and `&lieu=`, open the default view, as ADR-025 already said.
- Sharing a list, transfers and places outside the covered areas are left to their own steps.
- The notice of a copied address (step 8) stays as it is; a later issue handles it.

## Alternatives considered

- **Writing the view and the place while the sheet is open**: the reload would reopen the place, but a spot would move with the map, its position being the centre of the view.
- **Keeping the previous app's keys, `lieu`**: the app's base language is English, as ADR-025 chose `map` over `carte`.
- **Five decimals, as before**: ADR-025's rule keeps the centre within half a pixel at zoom 17, which needs six.
- **A text with the link in the share sheet**: on an iPhone, "Copy" then copies the text and loses the link.
- **« Lien copié » after a copy**: asked in #56, removed by the product owner.
- **A module beside the home page, or a higher line limit**: refused by `routes-compose-features`, and the maintainer's decision, as in ADR-053.
