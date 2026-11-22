# Feature: Share a link to a place or a spot

> The visitor shares the place or the spot of an open sheet. The phone's
> share sheet gets the link alone, under the name of the sheet. Where there
> is no share sheet, the link is copied instead.

## Rule: The share sheet gets the link alone

### Scenario: The visitor shares a place

- When the visitor shares "Café de Flore" at "https://example.org/#map=17/48.85/2.33&place=flore"
- Then the share sheet gets "Café de Flore" and "https://example.org/#map=17/48.85/2.33&place=flore"
- And the visitor is told that the link is shared

### Scenario: The visitor closes the share sheet without sharing

- Given the visitor will close the share sheet
- When the visitor shares "Café de Flore" at "https://example.org/#map=17/48.85/2.33&place=flore"
- Then the visitor is told that the share is cancelled

### Scenario: The share sheet fails

- Given the share sheet will fail
- When the visitor shares "Café de Flore" at "https://example.org/#map=17/48.85/2.33&place=flore"
- Then "https://example.org/#map=17/48.85/2.33&place=flore" is copied as the link
- And the visitor is told that the link is copied

## Rule: Without a share sheet, the link is copied

### Background:

- Given the device has no share sheet

### Scenario: The device copies the link

- When the visitor shares "Café de Flore" at "https://example.org/#map=17/48.85/2.33&place=flore"
- Then "https://example.org/#map=17/48.85/2.33&place=flore" is copied as the link
- And the visitor is told that the link is copied

### Scenario: The device refuses to copy the link

- Given the device refuses to copy the link
- When the visitor shares "Point sélectionné" at "https://example.org/#map=17/48.85404/2.33263&point=1"
- Then the visitor is told that the link could not be copied
