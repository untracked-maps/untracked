# Feature: Show places

> The map shows places as dots coloured by family. From afar, only the places
> put forward show, each from its own zoom, the best ranked first. Up close,
> from zoom 17, they stay and every other place joins them, family by family.

## Rule: Before zoom 17, a place put forward shows from its own zoom

### Background:

- Given these places
  | name               | kind       | family | minzoom | rank |
  | ------------------ | ---------- | ------ | ------- | ---- |
  | Tour Eiffel        | attraction | sight  | 11.5    | 0    |
  | Galeries Lafayette | shop       | shop   | 13.75   | 110  |
  | Chez Camille       | restaurant | food   | 16.5    | 199  |

### Scenario: The map is seen from too far

- When the map is at zoom 11.25
- Then no place is shown

### Scenario: A monument shows first

- When the map is at zoom 11.5
- Then the places shown are "Tour Eiffel"

### Scenario: A shop waits for its own zoom

- When the map is at zoom 13.5
- Then the places shown are "Tour Eiffel"

### Scenario: A well known shop shows from zoom 13.75

- When the map is at zoom 13.75
- Then the places shown are "Tour Eiffel, Galeries Lafayette"

### Scenario: Every place put forward shows from zoom 16.5

- When the map is at zoom 16.5
- Then the places shown are "Tour Eiffel, Galeries Lafayette, Chez Camille"

## Rule: Before zoom 17, a place without a family is not shown

### Scenario: A car park is not put forward

- Given these places
  | name                | kind    | family | minzoom | rank |
  | ------------------- | ------- | ------ | ------- | ---- |
  | Parking Tour Eiffel | parking |        | 16.5    | 199  |
- When the map is at zoom 16.75
- Then no place is shown

## Rule: Before zoom 17, when two places overlap, the best ranked wins

### Scenario: A monument goes before a shop

- Given these places
  | name               | kind       | family | minzoom | rank |
  | ------------------ | ---------- | ------ | ------- | ---- |
  | Galeries Lafayette | shop       | shop   | 13.75   | 110  |
  | Tour Eiffel        | attraction | sight  | 11.5    | 0    |
- When the map is at zoom 14
- Then "Tour Eiffel" goes before "Galeries Lafayette"

## Rule: From zoom 17, a place that does not show yet shows from the zoom of its family

### Background:

- Given these places
  | name               | kind       | family  | minzoom | rank |
  | ------------------ | ---------- | ------- | ------- | ---- |
  | Chez Camille       | restaurant | food    | 19      | 199  |
  | Café Martin        | cafe       | cafe    | 19      | 199  |
  | Le Comptoir Roux   | bar        | bar     | 19      | 199  |
  | Boulangerie Garcia | bakery     | bakery  | 19      | 199  |
  | Musée Rodin        | museum     | culture | 19      | 99   |
  | Arc de Triomphe    | monument   | sight   | 19      | 6    |
  | Pharmacie Petit    | pharmacy   | health  | 19      | 199  |
  | Hôtel Dupont       | hotel      | stay    | 19      | 199  |
  | Square Jean Moulin | park       | nature  | 19      | 99   |
  | Galeries Lafayette | shop       | shop    | 19      | 110  |
  | Banque de France   | bank       | money   | 19      | 199  |
  | Station Total      | fuel       | fuel    | 19      | 199  |
  | Gare du Nord       | station    | train   | 19      | 20   |
  | Parking Vinci      | parking    |         | 19      | 199  |
  | École Jules Ferry  | school     |         | 19      | 199  |

### Scenario: Where to eat, what to see, where to be cared for and where to sleep show from zoom 17

- When the map is at zoom 17
- Then the places shown are "Chez Camille, Café Martin, Le Comptoir Roux, Boulangerie Garcia, Musée Rodin, Arc de Triomphe, Pharmacie Petit, Hôtel Dupont"

### Scenario: Parks, shops, banks and fuel stations show from zoom 17.5

- When the map is at zoom 17.5
- Then the places shown are "Chez Camille, Café Martin, Le Comptoir Roux, Boulangerie Garcia, Musée Rodin, Arc de Triomphe, Pharmacie Petit, Hôtel Dupont, Square Jean Moulin, Galeries Lafayette, Banque de France, Station Total"

### Scenario: A place without a family shows from zoom 18, but neither a school nor a station that did not show from afar

- When the map is at zoom 18
- Then the places shown are "Chez Camille, Café Martin, Le Comptoir Roux, Boulangerie Garcia, Musée Rodin, Arc de Triomphe, Pharmacie Petit, Hôtel Dupont, Square Jean Moulin, Galeries Lafayette, Banque de France, Station Total, Parking Vinci"

## Rule: From zoom 17, a place that showed from afar stays on the map

### Background:

- Given these places
  | name               | kind    | family | minzoom | rank |
  | ------------------ | ------- | ------ | ------- | ---- |
  | Galeries Lafayette | shop    | shop   | 13.75   | 110  |
  | Gare du Nord       | station | train  | 12.5    | 20   |

### Scenario: A well known shop stays before the other shops show

- When the map is at zoom 17
- Then the places shown are "Galeries Lafayette, Gare du Nord"

### Scenario: A station stays a dot up close

- When the map is at zoom 19
- Then the places shown are "Galeries Lafayette, Gare du Nord"

### Scenario: A station goes before a shop

- When the map is at zoom 17
- Then "Gare du Nord" goes before "Galeries Lafayette"

## Rule: From zoom 17, when two places overlap, the families go in order

### Scenario: From where to eat down to banks

- Given these places
  | name               | kind       | family  | minzoom | rank |
  | ------------------ | ---------- | ------- | ------- | ---- |
  | Parking Vinci      | parking    |         | 16.5    | 199  |
  | Banque de France   | bank       | money   | 16.5    | 199  |
  | Galeries Lafayette | shop       | shop    | 13.75   | 110  |
  | Square Jean Moulin | park       | nature  | 16.5    | 99   |
  | Hôtel Dupont       | hotel      | stay    | 16.5    | 199  |
  | Pharmacie Petit    | pharmacy   | health  | 16.5    | 199  |
  | Musée Rodin        | museum     | culture | 16.5    | 99   |
  | Le Comptoir Roux   | bar        | bar     | 16.5    | 199  |
  | Chez Camille       | restaurant | food    | 16.5    | 199  |
- When the map is at zoom 18
- Then the places go in this order: "Chez Camille, Le Comptoir Roux, Musée Rodin, Pharmacie Petit, Hôtel Dupont, Square Jean Moulin, Galeries Lafayette, Banque de France, Parking Vinci"

### Scenario: Families of the same priority go together

- Given these places
  | name               | kind       | family  | minzoom | rank |
  | ------------------ | ---------- | ------- | ------- | ---- |
  | Chez Camille       | restaurant | food    | 16.5    | 199  |
  | Café Martin        | cafe       | cafe    | 16.5    | 199  |
  | Le Comptoir Roux   | bar        | bar     | 16.5    | 199  |
  | Boulangerie Garcia | bakery     | bakery  | 16.5    | 199  |
  | Musée Rodin        | museum     | culture | 16.5    | 99   |
  | Arc de Triomphe    | monument   | sight   | 11.75   | 6    |
  | Banque de France   | bank       | money   | 16.5    | 199  |
  | Station Total      | fuel       | fuel    | 16.5    | 199  |
- When the map is at zoom 18
- Then "Café Martin" goes along with "Chez Camille"
- And "Boulangerie Garcia" goes along with "Le Comptoir Roux"
- And "Arc de Triomphe" goes along with "Musée Rodin"
- And "Station Total" goes along with "Banque de France"

## Rule: The place open in its sheet shows no small dot, since a larger one marks it

### Background:

- Given these places
  | name               | kind       | family | minzoom | rank |
  | ------------------ | ---------- | ------ | ------- | ---- |
  | Tour Eiffel        | attraction | sight  | 11.5    | 0    |
  | Galeries Lafayette | shop       | shop   | 13.75   | 110  |

### Scenario: The visitor opens the sheet of a place

- Given "Tour Eiffel" is open in its sheet
- When the map is at zoom 16
- Then the places shown are "Galeries Lafayette"

### Scenario: The visitor closes the sheet of the place

- Given "Tour Eiffel" is open in its sheet
- And its sheet is closed
- When the map is at zoom 16
- Then the places shown are "Tour Eiffel, Galeries Lafayette"

## Rule: Without its places, the map shows no dot

### Scenario: The places cannot be loaded

- Given the places cannot be loaded
- When the map is at zoom 17
- Then no place is shown
