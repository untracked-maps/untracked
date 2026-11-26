# Feature: Glance at a place

> Under the name of a place, a line says when its information was last
> checked, and a strip sums up what matters at a glance: whether it is open,
> how far it is, whether a wheelchair gets in, whether the entrance is free.
> A column shows only what is known.

## Rule: The strip shows only what is known, in a fixed order

### Scenario: A place of which everything is known

- Given a glanced place tagged
  | wheelchair | limited |
  | fee | yes |
- And its opening hours are shown
- And the visitor stands 450 metres from it
- When the visitor glances at it on "2026-11-26T12:00Z"
- Then the strip shows
  | hours |
  | distance |
  | wheelchair limited |
  | entrance paid |

### Scenario: A place of which nothing is known has no strip

- Given a glanced place tagged
  | name | Chez Paul |
- When the visitor glances at it on "2026-11-26T12:00Z"
- Then the strip shows nothing

### Scenario: A distance needs the position of the visitor

- Given a glanced place tagged
  | fee | no |
- When the visitor glances at it on "2026-11-26T12:00Z"
- Then the strip shows
  | entrance free |

### Scenario: A value the app cannot read makes no column

- Given a glanced place tagged
  | wheelchair | designated |
  | fee | donation |
- When the visitor glances at it on "2026-11-26T12:00Z"
- Then the strip shows nothing

## Rule: Information checked in the last 24 months is verified

### Scenario: A place checked recently

- Given a glanced place tagged
  | check_date | 2025-03-12 |
- When the visitor glances at it on "2026-11-26T12:00Z"
- Then its information was verified in month "3" of "2025"

### Scenario: A place checked long ago

- Given a glanced place tagged
  | check_date | 2023-06-02 |
- When the visitor glances at it on "2026-11-26T12:00Z"
- Then its information has not been verified since month "6" of "2023"

### Scenario: The check of the opening hours stands for the place

- Given a glanced place tagged
  | check_date:opening_hours | 2026-02-01 |
- When the visitor glances at it on "2026-11-26T12:00Z"
- Then its information was verified in month "2" of "2026"

### Scenario: A place never checked says nothing of its freshness

- Given a glanced place tagged
  | name | Chez Paul |
- When the visitor glances at it on "2026-11-26T12:00Z"
- Then nothing is said of its freshness
