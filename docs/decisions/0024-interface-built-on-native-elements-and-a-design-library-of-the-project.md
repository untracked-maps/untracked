---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# The interface built on native elements and a design library of the project

## Context and Problem Statement

The app rebuilds the look of a previous app: its scales, its font, its sheets that follow the finger, its windows and menus, its photo viewer. The code has no mutable state and no store ([0009](0009-abilities-are-rxjs-stream-functions-without-a-store.md)), the Content Security Policy forbids inline styles and raw HTML ([0019](0019-a-strict-content-security-policy-built-from-hashes.md)), and no logic lives in components ([0011](0011-no-logic-in-components-or-pages.md)). Every kilobyte of the first view counts against the map's ([0022](0022-what-the-first-view-does-not-need-loaded-on-demand.md)).

The platform now offers modal and non-modal dialogs, popovers opened by invoker commands, colours that follow the colour scheme, and fonts served by the site. Component, gallery and viewer libraries offer the rest, at a weight and with conventions of their own.

How should the interface be built, so that it keeps the previous app's look and gestures, stays accessible, and adds no state, no style convention and no weight it does not need?

## Decision Drivers

- What the browser does natively, it does: focus, inert background, Escape, top layer.
- No mutable reference and no script-driven open state.
- One styling convention: the scoped styles of components, fed by tokens.
- Gestures and placements are rules, tested as pure functions, not hidden in a component.
- No weight for features the app does not use.

## Considered Options

- Native dialogs and popovers, design tokens, a font served by the site, a generic design library, gestures as pure functions in libraries of the project
- A headless component library, such as Bits UI, Melt UI or shadcn-svelte
- Tailwind CSS for styles
- Dialogs and panels driven by script
- Gallery and viewer libraries, such as PhotoSwipe or Photo Sphere Viewer

## Decision Outcome

Chosen option: « Native dialogs and popovers, design tokens, a font served by the site, a generic design library, gestures as pure functions in libraries of the project », because it leaves to the browser what it does accessibly, needs no mutable state, and keeps every rule of a gesture testable apart from the screen.

### Native dialogs and popovers

Modal windows are native modal dialogs, opened and closed by invoker commands; menus are native popovers. The browser traps the focus, makes the page inert, closes on Escape and places them in the top layer. A sheet that keeps the map in use is not modal.

### Design tokens as CSS custom properties

Colours, surfaces, shadows, radii and spacing are custom properties, declared once. Each colour holds its light and dark values and follows the colour scheme of the page, so tokens know nothing of how the theme is chosen.

### A font served by the site

The interface uses Inter, served by the site from its package, as the map's labels are. No font comes from a third party.

### A generic design library

The design library holds the global stylesheet and the generic components that screens use: frame, buttons, dialogs, menus, sheets, fields, icons. It knows no feature. One sheet component draws the bottom sheet of phones and the side panel of large screens, chosen by a media query.

### Gestures and placements as pure functions

What a touch does to a sheet, a window or a photo, and where a menu is placed, are pure functions of the events and measures, folded by a stream; a component only measures and passes events. Touch events are used rather than pointer events, since a sheet must both scroll and follow the finger. The gestures and viewer of the photos still live inside their ability; the target is a library of the project, with the tests a library is asked for. Target, tracked by #159.

### Consequences

- Good, because the accessibility of windows and menus comes from the browser, and nothing waits for the app's scripts to open them.
- Good, because no state, no store and no inline style is needed, under the rules of the code and the Content Security Policy.
- Good, because every threshold of a gesture is a named, unit-tested value, apart from the component.
- Good, because the interface carries no library weight for controls the platform already gives.
- Bad, because every gesture and every viewer is code the project writes and maintains, which a library would have brought tested.
- Bad, because invoker commands, popovers and colours that follow the scheme need recent browsers.
- Neutral, because a menu is placed by a function of the project, not by CSS anchor positioning, whose fallbacks are not tried once a panel scrolls.

## Pros and Cons of the Options

### A headless component library, such as Bits UI, Melt UI or shadcn-svelte

Well-tested accessible behaviours. A dependency for a handful of controls that native elements already make accessible, a second styling convention beside scoped styles, and, for shadcn-svelte, Tailwind.

### Tailwind CSS for styles

Utilities and a ready scale. Classes in every template instead of scoped styles, a build step of its own, and tokens declared in its configuration rather than in CSS.

### Dialogs and panels driven by script

Full control of when they open. They need a mutable reference, which the rules of the code forbid, and do nothing until the app's scripts have started.

### Gallery and viewer libraries, such as PhotoSwipe or Photo Sphere Viewer

Gestures, zoom and spheres ready to use. A dependency and its weight for gestures that pure functions of the project cover, and features the previous app never had.

## More Information

### Where to find the detail

- [The design library](../../src/libraries/design/)
- [The tokens](../../src/libraries/design/tokens.css)

### References

- [The dialog element](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element)
- [The popover attribute](https://html.spec.whatwg.org/multipage/popover.html)
- [Invoker commands](https://html.spec.whatwg.org/multipage/form-elements.html#attr-button-command)
- [The light-dark() function](https://www.w3.org/TR/css-color-5/#light-dark)
- [Inter](https://rsms.me/inter/)
- [#159: move the photo gestures and viewer into a library of the project](https://github.com/untracked-maps/untracked/issues/159)

### History

- 2026-11-28, marc-gavanier: first writing.
