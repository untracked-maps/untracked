# Feature: Inspect a point

> The visitor clicks a spot of the map, long-presses it on a touch screen, or
> presses Enter on the map to inspect its centre. A marker shows the spot and a
> card gives its address, or says there is none nearby.

## Rule: The visitor learns the address of the spot

### Background:

- Given these addresses on the map
  | number | street         | postcode | city  | longitude | latitude |
  | ------ | -------------- | -------- | ----- | --------- | -------- |
  | 12     | Rue de Tolbiac | 75013    | Paris | 2.3600    | 48.8300  |
  |        | Rue de Rivoli  | 75001    | Paris | 2.3380    | 48.8605  |
  | 97     | Rue de Paris   | 75019    | Paris | 2.4400    | 48.9000  |

### Scenario: The visitor inspects a spot by the Louvre

- When the visitor inspects the spot at longitude 2.3377 and latitude 48.8606
- Then the visitor reads the address "Rue de Rivoli" in "75001"

### Scenario: The visitor inspects a spot far from any address

- When the visitor inspects the spot at longitude 2.6 and latitude 48.95
- Then the visitor is told that there is no address at longitude 2.6 and latitude 48.95

## Rule: The visitor knows how the inspection goes

### Scenario: The addresses have not arrived yet

- Given the addresses on the map are on their way
- When the visitor inspects the spot at longitude 2.3377 and latitude 48.8606
- Then the visitor is told that the address is being looked for

### Scenario: The addresses cannot be loaded

- Given the addresses on the map cannot be loaded
- When the visitor inspects the spot at longitude 2.3377 and latitude 48.8606
- Then the visitor is told that the address is unavailable

## Rule: One spot at a time, until the visitor dismisses it

### Background:

- Given these addresses on the map
  | number | street         | postcode | city  | longitude | latitude |
  | ------ | -------------- | -------- | ----- | --------- | -------- |
  | 12     | Rue de Tolbiac | 75013    | Paris | 2.3600    | 48.8300  |
  |        | Rue de Rivoli  | 75001    | Paris | 2.3380    | 48.8605  |
  | 97     | Rue de Paris   | 75019    | Paris | 2.4400    | 48.9000  |

### Scenario: The visitor inspects another spot

- When the visitor inspects the spot at longitude 2.6 and latitude 48.95
- And the visitor inspects the spot at longitude 2.3377 and latitude 48.8606
- Then the visitor reads the address "Rue de Rivoli" in "75001"

### Scenario: The visitor dismisses the spot

- When the visitor inspects the spot at longitude 2.3377 and latitude 48.8606
- And the visitor dismisses the spot
- Then no spot is inspected
