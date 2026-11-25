# ADR-068 — One colour per basemap layer

**Date**: 2026-11-25
**Status**: accepted

## Context

Since #101, the Release runs of `main` fail the Lighthouse audit of the map pages ([ADR-022](ADR-022-lighthouse-budgets-per-page.md)): on #104, `/fr` reached a Total Blocking Time of 4,203, 4,091 and 3,833 ms on the CI runner, for a budget of 3,500 ms. Every run holds one task of 650 to 1,200 ms, which makes most of it.

Measured on 2026-11-25 with Chrome traces of the built site, the basemap of OpenFreeMap loaded, at Lighthouse's mobile size (412 × 823 px, device pixel ratio 1.75):

- The long task is a frame of MapLibre, not the app's code. About two thirds of the blocking time is the main thread waiting for the GPU at the commit of each frame (`GLES2::ReadPixels`, "GPU stall due to ReadPixels"): Chrome without a GPU draws WebGL with SwiftShader and composites in software, so it reads every frame back. A fifth is MapLibre's JavaScript in the frame, a tenth the hydration of the page; the overlays, the rxjs subscriptions and the places file weigh a few milliseconds.
- The cost of a frame grows with the shader programs it compiles for the first time: the frame that compiles two programs blocks for about 150 ms, the one that compiles seven for about 240 ms, against 30 to 60 ms for a frame that compiles none. MapLibre's `getProgram` alone takes about a fifth of its JavaScript at startup.
- MapLibre compiles one variant of a program for each way a layer binds its paint properties: a colour that depends on the feature, such as the `match` on `class` of the land cover, is a vertex attribute, and a constant one a uniform. The land cover was the only fill layer with such a colour: it alone made MapLibre compile two more programs, a fill and its outline, in the heaviest frame, out of eleven.

## Decision

- **A basemap layer paints its features with properties that depend on the zoom at most, never on the feature.** Where features need different colours, each colour gets its own layer, filtered on the property that told them apart.
- The land cover is split in two: `landcover` paints grass, farmland and wetland in the colour of parks, and `landcover-wood`, above it, the woods in their own colour.

## Consequences

- The map compiles nine shader programs at startup instead of eleven. Over seven Lighthouse runs per page, alternating both builds on the same machine (medians), the longest task fell from 880 to 698 ms on `/` and from 1,016 to 694 ms on `/fr`, and the Total Blocking Time from 2,538 to 2,202 ms and from 2,556 to 2,323 ms. Scaled by each run's benchmark index, the gain on the Total Blocking Time is 20 to 170 ms, within the spread of the runs. A second measure, five runs per page, found the longest task shorter by 75 ms on `/` and 169 ms on `/fr`, and no difference in the Total Blocking Time beyond the spread of the runs ([ADR-069](ADR-069-measuring-what-the-visitor-of-the-map-sees.md)).
- Where a wood overlaps grass, the wood is now always drawn above it; before, the order of the features in the tile decided.
- The names of the places shown on the map keep their colour per family: splitting them into one layer per family would change which names MapLibre hides when they collide, since it sorts symbols within a layer only.
- Most of the blocking time remains the GPU work of each frame on a machine without a GPU, which the app does not control.

## Alternatives considered

- **Raising the budget**: the decision of the maintainers, from the measures of the runner.
- **Labels without fade (`fadeDuration: 0`)**: measured, MapLibre rendered as many frames during startup, 10 to 17, since they follow the arrival of the tiles; and the labels would no longer fade in.
- **Creating the source of the place dots with its data rather than empty**: it loads once instead of twice in the worker, but seven runs per page measured no gain.
- **Enabling GPU compositing in Lighthouse's Chrome**: Chrome kept compositing in software and reading every frame back; and it would change the measure rather than the page.
- **Making every fill layer's colour depend on the feature**: also one variant, but the feature's colour would be stored in every vertex of every fill layer.
