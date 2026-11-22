# ADR-050 — Accessibility checks run once nothing moves

**Date**: 2026-11-22
**Status**: accepted

## Context

The end-to-end tests check every screen with axe-core ([ADR-012](ADR-012-testing-strategy.md)). Three elements appear with a short animation that starts transparent: the short notice ([ADR-045](ADR-045-short-notices-with-one-action.md)), from opacity 0 over 220 ms, and the bottom sheet and the side panel, from opacity 0.4 and 0 over 280 ms. The tests ran axe as soon as the element was visible, and Playwright counts an element as visible whatever its opacity.

On 2026-11-22 the accessibility test of the notice failed once on GitHub (#62). The colours that axe measured on the « Undo » button were `#4771dc` on `#f5f7fa`, 4.19:1. The button is `--accent`, `rgb(42 91 215)`, on `--accent-soft`, which passes 4.5:1: the measured colours were these colours half transparent. With the animations slowed down ten times through the Chrome DevTools Protocol, the test failed each time, measuring 1.25:1.

## Decision

- **Each end-to-end accessibility check waits until no animation of the page runs**, then runs axe. A helper of the end-to-end tests, `violationsOf`, waits for the `finished` promise of every running animation of the Web Animations API, again until none is left, since an animation may start another or be cancelled.
- **A test slows the animations down ten times** and checks the notice: it fails without the wait and passes with it, so that the race shows at each run rather than now and then.

## Consequences

- The colours checked are the ones a visitor sees once the element has appeared.
- An animation that never ends would make a check wait until the test times out; the app has none.
- The tests of the map, of the sheet of a spot, of the sheet of a place and of the windows and menus still call axe directly: other changes were under way in them. The sheets of a spot and of a place appear with the bottom sheet's animation, so their checks share the race until they use the helper.

## Alternatives considered

- **A longer timeout, or a retry**: the race would stay, only less often seen.
- **Emulating `prefers-reduced-motion: reduce`** in the accessibility tests: the app then shows no animation, which is simpler, but the tests would check another mode than most visitors see.
- **Waiting for a fixed time**: slower, and still wrong on a slow machine.
