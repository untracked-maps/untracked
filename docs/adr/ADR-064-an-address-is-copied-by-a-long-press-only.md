# ADR-064 — An address is copied by a long press only

**Date**: 2026-11-25
**Status**: accepted

## Context

The sheet of a place had two ways to copy its address ([ADR-049](ADR-049-the-sheet-of-a-place-and-addresses-in-components.md)): a "Copy the address" button in a row of its own, and a long press on the address. Issue #67 opens a sheet for an address and a street chosen in the search; oertio first kept "Copy the address" on the sheet of a street, then chose on 2026-11-25 to remove the button everywhere, and to keep the long press and give it to every sheet that shows an address.

## Decision

- **No sheet has a button to copy an address.** The sheet of a place loses its own; the sheets of #67 get none.
- **A long press on an address copies it**, as ADR-049 described it: 480 ms, the finger moving at most 10 px, a vibration of 10 ms where the device allows it, a short notice when the copy is refused. The sheets of #67 use the same attachment, `long-press` of the design library.
- The icon of the button, `copy-icon.svelte`, and its message go with it.

## Consequences

- The row of action buttons of a place without phone nor website is gone: the sheet peeks down to its whole height under its heading, as a sheet without actions does.
- Copying an address is less visible: nothing on screen says that a long press copies it.

## Alternatives considered

- **The button kept on every sheet**: the most visible, but a row of its own for one action, which oertio set aside.
- **The button on the sheet of a street only**, as first decided in #67: two sheets with the same layout would behave differently.
