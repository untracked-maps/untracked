# Feature: Inspect a point

> The visitor clicks a spot of the map, long-presses it on a touch screen, or
> presses Enter on the map to inspect its centre. A marker shows the spot and a
> card gives its address, or says there is none nearby.

## Rule: The visitor learns the address of the spot

### Scenario: The visitor inspects a spot by the Louvre

- Given the addresses of the fake Paris
- When the visitor inspects the spot at longitude 2.3377 and latitude 48.8606
- Then the visitor reads the address "Rue de Rivoli, 75001 Paris"

### Scenario: The visitor inspects a spot far from any address

- Given the addresses of the fake Paris
- When the visitor inspects the spot at longitude 2.6 and latitude 48.95
- Then the visitor is told that there is no address at longitude 2.6 and latitude 48.95

## Rule: The visitor knows how the inspection goes

### Scenario: The addresses have not arrived yet

- Given the addresses of the fake Paris are on their way
- When the visitor inspects the spot at longitude 2.3377 and latitude 48.8606
- Then the visitor is told that the address is being looked for

### Scenario: The addresses cannot be loaded

- Given the addresses of the fake Paris cannot be loaded
- When the visitor inspects the spot at longitude 2.3377 and latitude 48.8606
- Then the visitor is told that the address is unavailable

## Rule: One spot at a time, until the visitor dismisses it

### Scenario: The visitor inspects another spot

- Given the addresses of the fake Paris
- When the visitor inspects the spot at longitude 2.6 and latitude 48.95
- And the visitor inspects the spot at longitude 2.3377 and latitude 48.8606
- Then the visitor reads the address "Rue de Rivoli, 75001 Paris"

### Scenario: The visitor dismisses the spot

- Given the addresses of the fake Paris
- When the visitor inspects the spot at longitude 2.3377 and latitude 48.8606
- And the visitor dismisses the spot
- Then no spot is inspected
