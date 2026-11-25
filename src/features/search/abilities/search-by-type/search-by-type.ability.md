# Feature: Search by category

> The visitor names a category of places, such as "boulangerie", "pharmacies",
> "dab" or "the nearest pharmacy", in English or in French, or presses one of
> the chips under the search field. The nearest places of that category around
> the centre of the map are listed, the nearest first, and marked on the map.
> A category gathers one kind of place or more: the parks and the gardens are
> one category.

## Rule: A category is named by its words, in English or in French

### Scenario: The visitor types a category in French

- When the visitor types "boulangerie"
- Then the search field offers the category "bakeries"

### Scenario: The visitor types a category in the plural, in English

- When the visitor types "pharmacies"
- Then the search field offers the category "pharmacies"

### Scenario: The visitor types neither accents nor capitals

- When the visitor types "hopital"
- Then the search field offers the category "hospitals"

### Scenario: The visitor names a category among filler words

- When the visitor types "pharmacie la plus proche"
- Then the search field offers the category "pharmacies"

### Scenario: The visitor types an everyday word

- When the visitor types "dab"
- Then the search field offers the category "cash-machines"

### Scenario: The visitor types the name of a place

- When the visitor types "boulangerie garcia"
- Then the search field offers no category

## Rule: The first category that holds every word typed is offered

### Scenario: A word of two categories names the first

- When the visitor types "station"
- Then the search field offers the category "metro"

### Scenario: A second word names the other

- When the visitor types "station service"
- Then the search field offers the category "fuel"

## Rule: The nearest places of the category come first, around the centre of the map

### Background:

- Given these places around the map
  | name               | kind     | longitude | latitude |
  | ------------------ | -------- | --------- | -------- |
  | Pharmacie Centrale | pharmacy | 2.3523    | 48.8566  |
  | Boulangerie Pons   | bakery   | 2.4480    | 48.9090  |
  | Boulangerie Noel   | bakery   | 2.3540    | 48.8570  |

### Scenario: The visitor looks for bakeries in the centre of Paris

- When the visitor looks for "bakeries"
- Then the first place listed is "Boulangerie Noel"

### Scenario: The visitor looks from the north-east of Paris

- Given the map is centred at longitude 2.45 and latitude 48.91
- When the visitor looks for "bakeries"
- Then the first place listed is "Boulangerie Pons"

### Scenario: The map is told where the places listed stand

- When the visitor looks for "bakeries"
- Then the map is told to show 1 place, the first at 48.857, 2.354

## Rule: A category lists the places of each of its kinds

### Scenario: The visitor looks for parks and gardens

- Given these places around the map
  | name                 | kind   | longitude | latitude |
  | -------------------- | ------ | --------- | -------- |
  | Square du Temple     | park   | 2.3610    | 48.8640  |
  | Jardin des Tuileries | garden | 2.3270    | 48.8635  |
- When the visitor looks for "parks"
- Then 2 places are listed

## Rule: The places listed are within 3.5 km, 25 at most

### Scenario: Many bakeries are near

- Given 30 places of kind "bakery" around the centre of the map
- When the visitor looks for "bakeries"
- Then 25 places are listed

### Scenario: Few hospitals are near

- Given these places around the map
  | name                | kind     | longitude | latitude |
  | ------------------- | -------- | --------- | -------- |
  | Hôtel-Dieu          | hospital | 2.3490    | 48.8550  |
  | Hôpital Saint-Louis | hospital | 2.3690    | 48.8740  |
  | Hôpital Avicenne    | hospital | 2.4300    | 48.9150  |
- When the visitor looks for "hospitals"
- Then 2 places are listed

### Scenario: No garden is near

- Given these places around the map
  | name                 | kind   | longitude | latitude |
  | -------------------- | ------ | --------- | -------- |
  | Jardin des Tuileries | garden | 2.3270    | 48.8635  |
- And the map is centred at longitude 2.45 and latitude 48.91
- When the visitor looks for "parks"
- Then the visitor is told that no such place is near

## Rule: The visitor knows how the search goes

### Scenario: The places cannot be loaded

- Given the places around the map cannot be loaded
- When the visitor looks for "bakeries"
- Then the visitor is told that the list is unavailable
