# ADR-076 — Fake photos prerendered, shown in a strip and a full-screen viewer

**Date**: 2026-11-27
**Status**: proposed

## Context

Step 16 of the rebuild plan (#46, #119) brings back the photos of a place: a strip of cards under the « at a glance » strip, and a full-screen viewer with a counter, arrows, swipes and zoom. The app is sealed ([ADR-059](ADR-059-rebuilding-the-former-app-frame.md)): no photo service is called, and the product owner chose fake photos made of flat colours with the pictogram of the place (#91), credited as sample images, no real source named. The maintainer reviews how these images are made (#46). The product owner agreed to the proposals of #119 on 2026-11-27.

## Decision

- **The fake photos are SVG files prerendered by the site**, at `photos/<family>-<shade>.svg`: 14 families (the 13 of the place dots and « none ») by 12 shades, 168 files of 0.3 to 0.5 kB. Each is 800 × 600, filled with the colour of the family darkened or lightened by up to 30 %, with the family's pictogram of the place dots in white in the middle. They are drawn from `place-dot-drawings.json`, so a photo and its dot always match, and served by the site itself, which the Content Security Policy already allows (`img-src 'self'`).
- **They are shown with `<img>`**, so that loading behaves as with real photos: grey frames that breathe until an image has loaded, then a fade-in of 0.25 s; neither with reduced motion.
- **The photos of a place are the OpenStreetMap key `image`**, as [ADR-043](ADR-043-standards-first-and-their-libraries-in-the-domain.md) asks: several values separated by `;`, in the details file of the places ([ADR-075](ADR-075-the-places-file-split-from-the-details-of-the-places.md)). The ability `show-photos` keeps only the paths of the site itself, in order and once each: an address of another site, a scheme or a climb out of the folder is left out.
- **One ordinary place in three gets 1 to 6 photos**, at random with a seed of its own; 25 famous places get theirs by hand, up to 12, in `landmark-photos.json`. Stations get none, as they get no tags.
- **The viewer is a modal `<dialog>`**: it takes the focus, Escape and the back button close it right after « About » (`photo viewer` in the closing order), and its touches never reach the sheet below. The photos scroll sideways with native scroll snapping on touch screens; with a mouse, the arrows and the arrow keys move from photo to photo, and the track does not scroll by itself, so that no scrolling region is left without keyboard access.
- **Swiping down, double touching and pinching are a pure reducer**, `photo-gesture.ts`, tested apart: a swipe becomes « down » past 12 px when 1.3 times more vertical than sideways, fades the photo to `1 − dy/500` (0.3 at least), and closes past 110 px; a double touch within 280 ms zooms 2.5 times or back; a pinch zooms from 1 to 5 times; a zoomed photo moves with the finger, within the screen.

## Consequences

- The details file grows from 45.7 to 52.1 of its 70 kB; the places file read at start does not change.
- The build writes 168 more files, 55.9 kB in all, fetched only when a sheet with photos opens.
- Real photos, when a source exists, replace the paths of the key `image`; the order of sources (own photos of a shop, then Wikimedia) and the filter of gambling and pornography sites wait for that data (#91).

## Alternatives considered

- **Photos drawn in the page as inline SVG**: nothing to load, but no loading frames and no fade-in, unlike real photos.
- **One image per kind of place**: 63 kinds by 12 shades, 756 files, for pictograms the dots draw per family anyway.
- **A gallery library** (PhotoSwipe, for one): a dependency for gestures the reducer covers in under 200 lines, and one more weight in the 200 kB of the app.
- **A key of our own for the number of photos**: lighter, but not a standard; `image` is the key OpenStreetMap documents for a photo of a place.
