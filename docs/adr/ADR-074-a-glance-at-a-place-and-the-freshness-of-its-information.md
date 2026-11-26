# ADR-074 — A glance at a place, and the freshness of its information

**Date**: 2026-11-26
**Status**: proposed

## Context

Step 14 of the rebuild plan (#46, #116) shows, in the sheet of a place, the former app's « en un coup d'œil » strip and the line that says when its information was last checked. The former app's code, read on 2026-11-26 and reported in #116, built the strip from up to five columns: the state of the place now, its rating, its distance from the visitor, its wheelchair access and its entrance fee, cut to four. It wrote the line from OpenStreetMap's `check_date`, else `check_date:opening_hours`, and counted 24 months as `(now − date) / 2.63 × 10⁹ ms`, a mean month of about 30.44 days.

[ADR-073](ADR-073-opening-hours-read-in-the-time-zone-of-the-place-by-a-library-loaded-apart.md) left the words of the state of a place to this step, and asked that they be built once, for the strip and for the lists of step 22.

## Decision

- **A new ability of the places feature, `glance-at-place`.** Its use case takes the place opened, the position of the visitor, whether the opening hours are shown, and the time, and gives the columns of the strip and the freshness of the place. A column exists only when its value is known, in the former app's order: hours, distance, wheelchair access, entrance. The rating waits for lot K; the cut to four columns comes with it, since four columns cannot be exceeded before.
- **The words of the state of a place** are built in `opening-status.presenter.ts`, in the `show-opening-hours` ability, as a head and its rest: « Fermé » and « ouvre demain à 9 h ». The strip shows the hours column through a snippet that the route passes, so that two abilities do not import each other ([ADR-006](ADR-006-features-and-abilities-on-a-hexagonal-core.md)). Unreadable hours show « Non lisibles », not the former app's « Incertains » (#91).
- **The values are OpenStreetMap's** ([ADR-043](ADR-043-standards-first-and-their-libraries-in-the-domain.md)): `wheelchair` = `yes`, `limited` or `no`; `fee` = `yes` or `no`; `check_date` written `YYYY-MM-DD` or `YYYY-MM`. Any other value makes no column, or no line.
- **24 months are 24 mean months of 2.63 × 10⁹ ms**, bound included, as the former app counted them (oertio, #116, 2026-11-26). The month and the year are written by `Intl.DateTimeFormat`, with an abbreviated month, in the language of the page.
- **The distance is measured from the position of the visitor**, as the crow flies, with the haversine formula, and only once the visitor has asked for it. Never from the centre of the map. The position comes from the `locate-me` ability, which is fake until lot G.
- **The window « Infos vérifiées »** is a `DialogButton` with a small trigger of 22 px, touched from 44 px. It shows the first two paragraphs of the former app; the third, which sends to « Signaler », waits for lot L (oertio, 2026-11-26). Escape and Back close it before the sheet: `place window` joins the closing order after the map menu.
- **The freshness line is part of the peek of the sheet**, above the actions; the strip is not (oertio, #116).

## Consequences

- The places file goes from 114.9 kB to 119.6 kB with gzip, of its 120 kB budget ([ADR-063](ADR-063-a-weight-budget-for-the-places-file.md)). To stay under it, only one place in five gets a check date, and one in seven a wheelchair access; the famous places get theirs by hand. A check date on most places, as #116 first planned, would weigh about 124.5 kB. The next step that adds data to the places file needs a decision on that budget first.
- The distance column appears only after the visitor asks for their position: a visitor who never does sees at most three columns.
- `--closed` joins the design tokens, beside `--open`.

## Alternatives considered

- **Calendar months**: a check of March 2024 stays verified until the end of March 2026. Clearer, but not what the former app did; the product owner chose to copy it.
- **The distance from the centre of the map**: always shown, but it says nothing true about the visitor.
- **A check date written `YYYY-MM` in the fake data**: about 2.5 kB lighter for the same share of places, but OpenStreetMap writes a day.
- **Raising the budget of the places file**: a rule change, for the maintainer; not done in this step.
