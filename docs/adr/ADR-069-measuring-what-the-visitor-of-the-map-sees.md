# ADR-069 — Measuring what the visitor of the map sees

**Date**: 2026-11-25
**Status**: proposed

## Context

Lighthouse holds the map pages to a Total Blocking Time of at most 3,500 ms ([ADR-022](ADR-022-lighthouse-budgets-per-page.md)). Since #101, the Release runs of `main` fail it, which blocks the deployment.

The traces of [ADR-068](ADR-068-one-colour-per-basemap-layer.md) show that about two thirds of that blocking time is the main thread waiting for WebGL drawn in software. A runner without a GPU draws the map with SwiftShader, composites in software, and reads every frame back. A phone draws it with its GPU, off the main thread.

Lighthouse's default throttling, `simulate`, loads the page at full speed, then multiplies by four every task of the main thread, waits for the GPU included. The `devtools` method instead slows the page's CPU by four while it loads, and its network too; the GPU process is not slowed.

Measured on 2026-11-25 on one machine, with the OpenFreeMap basemap loaded in every run, five runs per case, medians, the spread in brackets:

| Method     | Page  | TBT (ms)            | Longest task (ms) | LCP (ms) | Score |
| ---------- | ----- | ------------------- | ----------------- | -------- | ----- |
| `simulate` | `/`   | 2,636 [2,434–3,317] | 934               | 1,201    | 0.71  |
| `simulate` | `/fr` | 2,517 [2,262–3,433] | 894               | 1,201    | 0.71  |
| `devtools` | `/`   | 982 [831–1,242]     | 280               | 2,401    | 0.65  |
| `devtools` | `/fr` | 983 [835–1,100]     | 273               | 2,403    | 0.65  |

- `simulate` counts about 2.5 times more blocking time than `devtools`, and spreads about three times wider.
- `devtools` doubles the Largest Contentful Paint, since it really slows the network: the current budget of 1,500 ms would fail.
- Neither method has a GPU: `devtools` stops multiplying the software drawing, it does not remove it.
- The CI runner is two to two and a half times slower than this machine ([ADR-022](ADR-022-lighthouse-budgets-per-page.md)); these values set the ratios, not the budgets.

Native platforms measure what the user feels rather than a blocking time. Android measures the cold start, with a goal under 500 ms, and slow frames (16 to 700 ms) and frozen frames (700 ms to 5 s), in the lab with Macrobenchmark on real devices and in the field with Android vitals ([measuring performance](https://developer.android.com/topic/performance/measuring-performance), [slow rendering](https://developer.android.com/topic/performance/vitals/jank)). Apple measures the launch time, hangs and hitches, the time a frame is late per second of animation, with XCTest in the lab and MetricKit in the field ([WWDC20 10077](https://developer.apple.com/videos/play/wwdc2020/10077/), [MetricKit](https://developer.apple.com/documentation/metrickit)). Both rely on real devices and on data from real users. The app tracks no one, so it has no field data; a paid runner with a GPU is set aside for now.

## Options

- **A. Keep `simulate`, and set the budget of the map pages' Total Blocking Time from these measures.** Nothing else changes. The measure keeps counting the software drawing four times over, so it reports a page about 2.5 times more blocked than on a phone with a GPU, and spreads widely.
- **B. Move the map pages to `devtools`, and set all their budgets anew.** Total Blocking Time, Largest Contentful Paint and score would be measured first on the CI runner, over several commits. The blocking time is closer to what the page's own code costs, and steadier. The audit takes longer, since the page loads at the throttled speed.
- **C. Add, besides A or B, a measure of the map's smoothness.** An end-to-end scenario would pan and zoom the map and count the frames over 50 ms, as Android counts slow frames, and the time to the map's first frame. It would be measured in the lab on the runner, without collecting anything from visitors.

The pages without the map keep `simulate` and their strict budget in every option. The weight of the script, measured by size-limit, stays the guard that is the same on every machine.

## Decision

To be taken by the maintainers.

## Consequences

To be written once an option is chosen.

## Alternatives set aside

- **A runner with a GPU**: the measure closest to a phone, but paid; set aside for now, and open again if the options above are not enough.
- **Measuring on visitors' devices**: what the native platforms rely on most, but it would collect data from visitors, against the app's purpose.
- **Loading the map after the page is interactive**: already set aside by [ADR-022](ADR-022-lighthouse-budgets-per-page.md): the map is the page's content.
