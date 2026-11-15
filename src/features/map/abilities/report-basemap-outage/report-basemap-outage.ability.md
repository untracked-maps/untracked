# Feature: Report a basemap outage

> When the provider of the basemap stops answering, the map loses its
> streets and names. Rather than leave an empty map unexplained, the app
> tells the visitor, and withdraws the message as soon as tiles load again.
> A single failed tile, common on a mobile network, is not an outage.

## Rule: Three tiles failing in a row make an outage

### Scenario: The tiles stop loading

- Given the map is open
- When 3 tiles of the basemap fail in a row
- Then the visitor is told that the basemap is not responding

### Scenario: A few tiles fail on a shaky network

- Given the map is open
- When 2 tiles of the basemap fail in a row
- And a tile of the basemap loads
- And 2 tiles of the basemap fail in a row
- Then the visitor is told nothing

## Rule: A provider that cannot be reached at all is an outage at once

### Scenario: The description of the tiles does not load

- Given the map is open
- When the provider of the basemap cannot be reached
- Then the visitor is told that the basemap is not responding

## Rule: The message goes away when tiles load again

### Scenario: The provider answers again

- Given the map is open
- When 3 tiles of the basemap fail in a row
- And a tile of the basemap loads
- Then the visitor is told nothing
