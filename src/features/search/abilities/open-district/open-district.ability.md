# Feature: Open a district

> The visitor chooses a district in the search, a quarter or an arrondissement.
> A sheet gives its name and its city, and the map outlines it and frames it.

## Rule: The visitor reads the district chosen, outlined when its outline is known

### Background:

- Given these district outlines
  | name      | postcode | west | south  | east | north  |
  | --------- | -------- | ---- | ------ | ---- | ------ |
  | Le Marais | 75004    | 2.35 | 48.852 | 2.37 | 48.865 |

### Scenario: The visitor chooses a district with a known outline

- When the visitor chooses the district "Le Marais" in "75004", "Paris"
- Then the visitor reads the district "Le Marais" in "Paris"
- And the district is outlined

### Scenario: The visitor chooses a district without a known outline

- When the visitor chooses the district "Batignolles" in "75017", "Paris"
- Then the visitor reads the district "Batignolles" in "Paris"
- And the district is not outlined

### Scenario: The visitor closes the district

- When the visitor chooses the district "Le Marais" in "75004", "Paris"
- And the visitor closes the district
- Then no district is open

## Rule: The visitor still reads the district when its outlines cannot be loaded

### Scenario: The outlines cannot be loaded

- Given the district outlines cannot be loaded
- When the visitor chooses the district "Le Marais" in "75004", "Paris"
- Then the visitor reads the district "Le Marais" in "Paris"
- And the district is not outlined
