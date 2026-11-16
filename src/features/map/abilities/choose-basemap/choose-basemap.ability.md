# Feature: Choose the basemap

> The visitor chooses between the plan and the satellite view. The satellite
> view draws aerial photos under the labels of the plan, and they are fetched
> only once the visitor chooses it. The choice is kept on this device.

## Rule: The plan is drawn until the visitor chooses the satellite view

### Scenario: A first visit

- Given a visitor who never chose a basemap
- When the map is drawn
- Then the map draws no aerial photos
- And no aerial photos are fetched

## Rule: The satellite view draws the aerial photos

### Scenario: The visitor chooses the satellite view

- Given a visitor who never chose a basemap
- When the map is drawn
- And the visitor chooses the "satellite" basemap
- Then the map draws the aerial photos

### Scenario: The visitor goes back to the plan

- Given a visitor who chose the "satellite" basemap on an earlier visit
- When the map is drawn
- And the visitor chooses the "plan" basemap
- Then the map draws no aerial photos

## Rule: The choice is kept on this device

### Scenario: The visitor comes back after choosing the satellite view

- Given a visitor who chose the "satellite" basemap on an earlier visit
- When the map is drawn
- Then the map draws the aerial photos
