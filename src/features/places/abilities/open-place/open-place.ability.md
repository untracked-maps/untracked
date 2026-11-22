# Feature: Open the sheet of a place

> The visitor chooses a place among the suggestions of the search or in the
> list of a kind of places. Its sheet opens: its name, its type and its
> address, which the visitor can copy. Closing the sheet takes the visitor
> back to where the place was chosen.

## Rule: The sheet tells the place chosen

### Background:

- Given these places to open
  | id     | name                  | kind       | cuisine | house number | street                  | postal code |
  | ------ | --------------------- | ---------- | ------- | ------------ | ----------------------- | ----------- |
  | flore  | Café de Flore         | cafe       |         | 172          | Boulevard Saint-Germain | 75006       |
  | luigi  | Chez Luigi            | restaurant | italian | 12           | Rue de l'Éperon         | 75006       |
  | galant | Square du Vert-Galant |            |         |              |                         |             |

### Scenario: The visitor chooses a café

- When the visitor opens "flore" from the search
- Then the sheet of "Café de Flore" is open
- And its kind is "cafe"
- And its address is "172", "Boulevard Saint-Germain", "75006"

### Scenario: The visitor chooses a restaurant

- When the visitor opens "luigi" from the search
- Then its cuisine is "italian"

### Scenario: The visitor chooses a place without type nor address

- When the visitor opens "galant" from the search
- Then the sheet of "Square du Vert-Galant" is open
- And it has no kind
- And it has no address

### Scenario: The visitor chooses another place

- When the visitor opens "flore" from the search
- And the visitor opens "luigi" from the list of a kind
- Then the sheet of "Chez Luigi" is open

### Scenario: The place is not known

- When the visitor opens "tour-eiffel" from the search
- Then no sheet is open

## Rule: Closing the sheet takes the visitor back to where the place was chosen

### Background:

- Given these places to open
  | id    | name          | kind |
  | ----- | ------------- | ---- |
  | flore | Café de Flore | cafe |

### Scenario: The place was chosen among the suggestions of the search

- When the visitor opens "flore" from the search
- Then the sheet was opened from the search

### Scenario: The place was chosen in the list of a kind

- When the visitor opens "flore" from the list of a kind
- Then the sheet was opened from the list of a kind

### Scenario: The visitor closes the sheet

- When the visitor opens "flore" from the list of a kind
- And the visitor closes the sheet
- Then no sheet is open

## Rule: The sheet opens only once the places are there

### Scenario: The places cannot be loaded

- Given the places to open cannot be loaded
- When the visitor opens "flore" from the search
- Then no sheet is open

## Rule: The visitor copies the address shown

### Scenario: The device copies it

- When the visitor copies "172 Boulevard Saint-Germain, 75006 Paris"
- Then "172 Boulevard Saint-Germain, 75006 Paris" is copied
- And the visitor is told that the address is copied

### Scenario: The device refuses to copy it

- Given the device cannot copy
- When the visitor copies "172 Boulevard Saint-Germain, 75006 Paris"
- Then the visitor is told that the address could not be copied
