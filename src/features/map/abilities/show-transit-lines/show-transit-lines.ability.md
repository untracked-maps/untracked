# Feature: Show the transit lines

> The visitor shows or hides the metro, RER, train and tram lines of
> Île-de-France, drawn in their official colours under the labels of the map.
> They come from Île-de-France Mobilités, and are fetched only once the visitor
> shows them. The choice is kept on this device.

## Rule: The transit lines are hidden until the visitor shows them

### Scenario: A first visit

- Given a visitor who never showed the transit lines
- When the map opens
- Then the map draws no transit lines
- And no transit lines are fetched

## Rule: The transit lines are drawn once shown

### Scenario: The visitor shows the transit lines

- Given a visitor who never showed the transit lines
- When the map opens
- And the visitor shows the transit lines
- Then the map draws the transit lines

### Scenario: The visitor hides them again

- Given a visitor who showed the transit lines on an earlier visit
- When the map opens
- And the visitor hides the transit lines
- Then the map draws no transit lines

## Rule: The transit lines are fetched once

### Scenario: The visitor shows them twice

- Given a visitor who never showed the transit lines
- When the map opens
- And the visitor shows the transit lines
- And the visitor hides the transit lines
- And the visitor shows the transit lines
- Then the transit lines were fetched once

## Rule: The map stays as it was when the transit lines cannot be fetched

### Scenario: Île-de-France Mobilités does not answer

- Given a visitor who never showed the transit lines
- And transit lines that cannot be fetched
- When the map opens
- And the visitor shows the transit lines
- Then the map draws no transit lines

## Rule: The choice is kept on this device

### Scenario: The visitor comes back after showing the transit lines

- Given a visitor who showed the transit lines on an earlier visit
- When the map opens
- Then the map draws the transit lines
