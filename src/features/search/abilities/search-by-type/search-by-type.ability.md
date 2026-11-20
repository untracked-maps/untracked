# Feature: Search by type

> The visitor names a kind of place, such as "boulangerie", "pharmacies" or
> "the nearest pharmacy", in English or in French, or presses one of the chips
> under the search field. The nearest places of that kind around the centre of
> the map are listed, the nearest first, and marked on the map.

## Rule: A kind is named in English or in French, singular or plural

### Scenario: The visitor types a kind in French

- When the visitor types "boulangerie"
- Then the search field offers the bakeries near the visitor

### Scenario: The visitor types a kind in the plural, in English

- When the visitor types "pharmacies"
- Then the search field offers the pharmacies near the visitor

### Scenario: The visitor types neither accents nor capitals

- When the visitor types "hopital"
- Then the search field offers the hospitals near the visitor

### Scenario: The visitor names a kind among filler words

- When the visitor types "pharmacie la plus proche"
- Then the search field offers the pharmacies near the visitor

### Scenario: The visitor types the name of a place

- When the visitor types "boulangerie garcia"
- Then the search field offers no kind of place

## Rule: The nearest places of the kind come first, around the centre of the map

### Background:

- Given these places around the map
  | name               | kind     | longitude | latitude |
  | ------------------ | -------- | --------- | -------- |
  | Pharmacie Centrale | pharmacy | 2.3523    | 48.8566  |
  | Boulangerie Pons   | bakery   | 2.4480    | 48.9090  |
  | Boulangerie Noel   | bakery   | 2.3540    | 48.8570  |

### Scenario: The visitor looks for bakeries in the centre of Paris

- When the visitor looks for "bakery"
- Then the first place listed is "Boulangerie Noel"

### Scenario: The visitor looks from the north-east of Paris

- Given the map is centred at longitude 2.45 and latitude 48.91
- When the visitor looks for "bakery"
- Then the first place listed is "Boulangerie Pons"

## Rule: The places listed are within 3.5 km, 25 at most

### Scenario: Many bakeries are near

- Given 30 places of kind "bakery" around the centre of the map
- When the visitor looks for "bakery"
- Then 25 places are listed

### Scenario: Few hospitals are near

- Given these places around the map
  | name                | kind     | longitude | latitude |
  | ------------------- | -------- | --------- | -------- |
  | Hôtel-Dieu          | hospital | 2.3490    | 48.8550  |
  | Hôpital Saint-Louis | hospital | 2.3690    | 48.8740  |
  | Hôpital Avicenne    | hospital | 2.4300    | 48.9150  |
- When the visitor looks for "hospital"
- Then 2 places are listed

### Scenario: No garden is near

- Given these places around the map
  | name                 | kind   | longitude | latitude |
  | -------------------- | ------ | --------- | -------- |
  | Jardin des Tuileries | garden | 2.3270    | 48.8635  |
- And the map is centred at longitude 2.45 and latitude 48.91
- When the visitor looks for "garden"
- Then the visitor is told that no such place is near

## Rule: The visitor knows how the search goes

### Scenario: The places cannot be loaded

- Given the places around the map cannot be loaded
- When the visitor looks for "bakery"
- Then the visitor is told that the list is unavailable
