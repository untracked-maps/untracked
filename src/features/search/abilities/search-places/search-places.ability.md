# Feature: Search places

> The visitor types the name of a place, even with a typo or only its beginning.
> The best-known places that bear the name come first, the nearest when they are
> equally known. The visitor chooses one, and the map shows it at street level.

## Rule: A place is found by its name, even misspelt or cut short

### Background:

- Given these places to search
  | name            | fame |
  | --------------- | ---- |
  | Tour Eiffel     | 99   |
  | Grand Palais    | 90   |
  | Arc de Triomphe | 95   |
  | Musée d'Orsay   | 92   |
  | Musée du Louvre | 98   |

### Scenario: The visitor misspells a name

- When the visitor searches for "tour eifel"
- Then the first place found is "Tour Eiffel"

### Scenario: The visitor swaps two letters

- When the visitor searches for "tuor eiffel"
- Then the first place found is "Tour Eiffel"

### Scenario: The visitor types the beginning of a name

- When the visitor searches for "grnd palai"
- Then the first place found is "Grand Palais"

### Scenario: The visitor misspells the beginning of a name

- When the visitor searches for "arc de triomf"
- Then the first place found is "Arc de Triomphe"

### Scenario: The visitor types neither accents nor apostrophes

- When the visitor searches for "musee dorsay"
- Then the first place found is "Musée d'Orsay"

## Rule: A famous place comes before a lesser-known namesake

### Background:

- Given these places to search
  | name                | fame |
  | ------------------- | ---- |
  | Élysée Beauté       | 0    |
  | Palais de l'Élysée  | 96   |
  | Parking Tour Eiffel | 0    |
  | Tour Eiffel         | 99   |

### Scenario: A beauty salon is named after the Élysée

- When the visitor searches for "elysee"
- Then the first place found is "Palais de l'Élysée"

### Scenario: A car park is named after the Eiffel Tower

- When the visitor searches for "tour eiffel"
- Then the place found after it is "Parking Tour Eiffel"

## Rule: Among namesakes, the nearest to the centre of the map comes first

### Background:

- Given these places to search
  | name               | address                              | longitude | latitude |
  | ------------------ | ------------------------------------ | --------- | -------- |
  | Boulangerie Garcia | 12 Rue de Tolbiac, 75013 Paris       | 2.36      | 48.83    |
  | Boulangerie Garcia | 97 Rue de Paris, 75019 Paris         | 2.44      | 48.90    |
  | Boulangerie Garcia | 8 Passage Saint-Jacques, 75004 Paris | 2.25      | 48.87    |

### Scenario: Three bakeries bear the same name

- Given the visitor looks at the map around longitude 2.45 and latitude 48.91
- When the visitor searches for "boulangerie garcia"
- Then the first place found stands at "97 Rue de Paris, 75019 Paris"

### Scenario: The visitor looks from the other side of Paris

- Given the visitor looks at the map around longitude 2.24 and latitude 48.87
- When the visitor searches for "boulangerie garcia"
- Then the first place found stands at "8 Passage Saint-Jacques, 75004 Paris"

## Rule: Every word typed must match

### Scenario: No place bears every word

- Given these places to search
  | name            |
  | --------------- |
  | Musée du Louvre |
  | Tour Eiffel     |
- When the visitor searches for "musee eiffel"
- Then the visitor is told that no place is named "musee eiffel"

## Rule: The visitor sees at most seven places

### Scenario: Many places bear the name

- Given 9 places to search named "Pharmacie du Marché"
- When the visitor searches for "pharmacie"
- Then 7 places are found

## Rule: The visitor knows how the search goes

### Background:

- Given these places to search
  | name            |
  | --------------- |
  | Musée du Louvre |
  | Tour Eiffel     |

### Scenario: The query is too short

- When the visitor searches for "t"
- Then nothing is searched

### Scenario: The places have not arrived yet

- Given the places to search are on their way
- When the visitor searches for "louvre"
- Then the visitor is told that the search is on its way

### Scenario: The places cannot be loaded

- Given the places to search cannot be loaded
- When the visitor searches for "louvre"
- Then the visitor is told that the search is unavailable

## Rule: The map shows the chosen place at street level

### Background:

- Given these places to search
  | name            | longitude | latitude |
  | --------------- | --------- | -------- |
  | Musée du Louvre | 2.33764   | 48.86061 |

### Scenario: The visitor chooses a place on a map seen from afar

- When the visitor chooses "Musée du Louvre" on a map at zoom level 13
- Then the map flies to longitude 2.33764 and latitude 48.86061
- And the map shows the place at zoom level 16.5

### Scenario: The visitor chooses a place on a map seen from close by

- When the visitor chooses "Musée du Louvre" on a map at zoom level 18
- Then the map shows the place at zoom level 18
