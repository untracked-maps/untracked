# Feature: Locate me

> The visitor asks the map to show where they are.
> The map centres on their position, at street level, and marks it.

## Rule: The map centres on the position of the visitor

### Scenario: The visitor shares their position

- Given the visitor stands at longitude 2.3499 and latitude 48.853
- When the visitor asks to be located
- Then the map is centred on longitude 2.3499 and latitude 48.853
- And the map shows the street at zoom level 16

## Rule: The visitor knows the map is looking for them

### Scenario: The position is on its way

- Given the position of the visitor has not arrived yet
- When the visitor asks to be located
- Then the visitor is told that their position is being looked for

## Rule: The map says why it cannot locate the visitor

### Scenario: The visitor refuses to share their position

- Given the visitor refuses to share their position
- When the visitor asks to be located
- Then the visitor is told that they did not allow it

### Scenario: The device cannot find the position

- Given the device cannot find the position of the visitor
- When the visitor asks to be located
- Then the visitor is told that their position cannot be found
