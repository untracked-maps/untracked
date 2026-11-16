# Feature: Show the bike lanes

> The visitor shows or hides the bike lanes of France, in the colours of the
> map. They come from OpenStreetMap, as of January 2024, through the tiles of
> the Géoplateforme of IGN, which are fetched only once the visitor shows them,
> and only when the map is zoomed in close enough to read them. The choice is
> kept on this device.

## Rule: The bike lanes are hidden until the visitor shows them

### Scenario: A first visit

- Given a visitor who never showed the bike lanes
- When the map is shown in the "light" palette
- Then the map draws no bike lanes

## Rule: The bike lanes are drawn in the palette of the map

### Scenario: The visitor shows the bike lanes

- Given a visitor who never showed the bike lanes
- When the map is shown in the "light" palette
- And the visitor shows the bike lanes
- Then the map draws the bike lanes in the "light" palette

### Scenario: The map turns dark

- Given a visitor who showed the bike lanes on an earlier visit
- When the map is shown in the "light" palette
- And the map turns to the "dark" palette
- Then the map draws the bike lanes in the "dark" palette

### Scenario: The visitor hides them again

- Given a visitor who showed the bike lanes on an earlier visit
- When the map is shown in the "light" palette
- And the visitor hides the bike lanes
- Then the map draws no bike lanes

## Rule: The choice is kept on this device

### Scenario: The visitor comes back after showing the bike lanes

- Given a visitor who showed the bike lanes on an earlier visit
- When the map is shown in the "dark" palette
- Then the map draws the bike lanes in the "dark" palette
