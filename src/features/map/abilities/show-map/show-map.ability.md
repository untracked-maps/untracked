# Feature: Show the map

> The app opens on a map of Paris, drawn from the basemap of its provider.
> Everything else the app shows sits on this map.

## Rule: The map opens on Paris

### Scenario: Opening the app

- Given the basemap of the provider
- When the visitor opens the map
- Then the map is centred on Paris
- And the map shows the city at zoom level 13

## Rule: The map shows the basemap of its provider

### Scenario: The provider's basemap is drawn

- Given the basemap of the provider
- When the visitor opens the map
- Then the map shows that basemap
