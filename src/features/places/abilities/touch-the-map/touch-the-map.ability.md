# Feature: Touch the map

> A touch on the map does the first of these that applies: on the dot of a
> place, it opens the place; on an empty spot, it closes the sheet open, or opens
> the sheet of the spot when no sheet is open. A long press, or a right click,
> opens the place under it, or the sheet of the spot even when a sheet is open.

## Rule: A touch on the dot of a place opens the place

### Scenario: The visitor touches the dot of a place

- When the visitor touches the dot of "flore" at longitude 2.3325 and latitude 48.8541
- Then the place "flore" opens

### Scenario: The visitor touches the dot of a place while a sheet is open

- Given a sheet is open
- When the visitor touches the dot of "flore" at longitude 2.3325 and latitude 48.8541
- Then the place "flore" opens

## Rule: A touch on an empty spot closes the sheet open, or opens the sheet of the spot

### Scenario: No sheet is open

- When the visitor touches the map at longitude 2.3377 and latitude 48.8606
- Then the sheet of the spot at longitude 2.3377 and latitude 48.8606 opens

### Scenario: A sheet is open

- Given a sheet is open
- When the visitor touches the map at longitude 2.3377 and latitude 48.8606
- Then the sheet open closes

### Scenario: The sheet was closed before the touch

- Given a sheet is open
- And the sheet is closed
- When the visitor touches the map at longitude 2.3377 and latitude 48.8606
- Then the sheet of the spot at longitude 2.3377 and latitude 48.8606 opens

## Rule: A long press opens the place under it, or the sheet of the spot even when a sheet is open

### Scenario: The visitor long-presses the dot of a place

- Given a sheet is open
- When the visitor long-presses the dot of "flore" at longitude 2.3325 and latitude 48.8541
- Then the place "flore" opens

### Scenario: The visitor long-presses an empty spot while a sheet is open

- Given a sheet is open
- When the visitor long-presses the map at longitude 2.3377 and latitude 48.8606
- Then the sheet of the spot at longitude 2.3377 and latitude 48.8606 opens
