# Feature: Show the opening hours of a place

> The sheet of a place shows its week, from Monday to Sunday, read from its
> OpenStreetMap opening hours. It knows whether the place is open now and when
> that changes, in the time zone of the place, with the public holidays of its
> country. A place that should have opening hours and has none says they are
> not known yet.

## Rule: The week of a place is read from its opening hours

### Scenario: A place open on weekdays, with a break

- Given a place in Paris with the opening hours "Mo-Fr 09:00-12:00,14:00-19:30; Sa 10:00-13:00"
- When the visitor opens it at "2026-11-24T11:00+01:00"
- Then its week is
  | monday | 9:00-12:00, 14:00-19:30 |
  | tuesday | 9:00-12:00, 14:00-19:30 |
  | wednesday | 9:00-12:00, 14:00-19:30 |
  | thursday | 9:00-12:00, 14:00-19:30 |
  | friday | 9:00-12:00, 14:00-19:30 |
  | saturday | 10:00-13:00 |
  | sunday | closed |
- And today is "tuesday"

### Scenario: An evening that ends after midnight stays on the day it began

- Given a place in Paris with the opening hours "Fr,Sa 19:00-02:00"
- When the visitor opens it at "2026-11-24T11:00+01:00"
- Then its week is
  | monday | closed |
  | tuesday | closed |
  | wednesday | closed |
  | thursday | closed |
  | friday | 19:00-2:00 |
  | saturday | 19:00-2:00 |
  | sunday | closed |

### Scenario: A place never closes

- Given a place in Paris with the opening hours "24/7"
- When the visitor opens it at "2026-11-24T11:00+01:00"
- Then its week is
  | monday | all day |
  | tuesday | all day |
  | wednesday | all day |
  | thursday | all day |
  | friday | all day |
  | saturday | all day |
  | sunday | all day |

### Scenario: The hours of a day are marked unknown

- Given a place in Paris with the opening hours "Mo-Fr 10:00-19:00; Sa unknown"
- When the visitor opens it at "2026-11-24T11:00+01:00"
- Then its week is
  | monday | 10:00-19:00 |
  | tuesday | 10:00-19:00 |
  | wednesday | 10:00-19:00 |
  | thursday | 10:00-19:00 |
  | friday | 10:00-19:00 |
  | saturday | uncertain |
  | sunday | closed |

### Scenario: A public holiday of the country of the place closes it that day

- Given a place in Paris with the opening hours "Mo-Fr 09:00-18:00; PH off"
- When the visitor opens it at "2026-12-23T11:00+01:00"
- Then its week is
  | monday | 9:00-18:00 |
  | tuesday | 9:00-18:00 |
  | wednesday | 9:00-18:00 |
  | thursday | 9:00-18:00 |
  | friday | closed |
  | saturday | closed |
  | sunday | closed |

## Rule: The state of a place now is told with the moment it changes

### Scenario: Open, closing later today

- Given a place in Paris with the opening hours "Mo-Sa 09:00-19:00"
- When the visitor opens it at "2026-11-24T11:00+01:00"
- Then it is "open" until "today" at "19:00"

### Scenario: Closed, opening tomorrow

- Given a place in Paris with the opening hours "Mo-Sa 09:30-19:00"
- When the visitor opens it at "2026-11-24T20:00+01:00"
- Then it is "closed" until "tomorrow" at "9:30"

### Scenario: Open, closing tonight after midnight

- Given a place in Paris with the opening hours "Mo-Su 18:00-02:00"
- When the visitor opens it at "2026-11-24T20:00+01:00"
- Then it is "open" until "tonight" at "2:00"

### Scenario: Closed, opening on another day of the week

- Given a place in Paris with the opening hours "Mo 09:00-12:00"
- When the visitor opens it at "2026-11-24T11:00+01:00"
- Then it is "closed" until "monday" at "9:00"

### Scenario: Closed, opening in more than a week

- Given a place in Paris with the opening hours "Dec 08 10:00-12:00"
- When the visitor opens it at "2026-11-24T11:00+01:00"
- Then it is "closed" until the "8" of month "12"

### Scenario: Open and never closing

- Given a place in Paris with the opening hours "24/7"
- When the visitor opens it at "2026-11-24T11:00+01:00"
- Then it is "open" with no change ahead

### Scenario: Closed and never opening

- Given a place in Paris with the opening hours "off"
- When the visitor opens it at "2026-11-24T11:00+01:00"
- Then it is "closed" with no change ahead

### Scenario: The rule of now is marked unknown

- Given a place in Paris with the opening hours "Mo-Fr 09:00-19:00 unknown"
- When the visitor opens it at "2026-11-24T11:00+01:00"
- Then its state is uncertain

### Scenario: Closed on a public holiday of France

- Given a place in Paris with the opening hours "Mo-Fr 09:00-18:00; PH off"
- When the visitor opens it at "2026-05-08T11:00+02:00"
- Then it is "closed" until "monday" at "9:00"

### Scenario: The time of the place counts, not the time of the device

- Given a place in Los Angeles with the opening hours "Mo-Fr 09:00-19:00"
- When the visitor opens it at "2026-11-24T18:00-08:00"
- Then it is "open" until "today" at "19:00"

## Rule: A place without readable opening hours says so

### Scenario: The hours are badly written

- Given a place in Paris with the opening hours "9h-18h sauf dimanche"
- When the visitor opens it at "2026-11-24T11:00+01:00"
- Then its opening hours cannot be read

### Scenario: A place that should have opening hours has none

- Given a place of kind "bakery" in Paris without opening hours
- When the visitor opens it at "2026-11-24T11:00+01:00"
- Then its opening hours are not known yet

### Scenario: A place that has no opening hours to have has none

- Given a place of kind "park" in Paris without opening hours
- When the visitor opens it at "2026-11-24T11:00+01:00"
- Then no opening hours are shown
