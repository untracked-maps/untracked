# Feature: Close what is open

> The Escape key and the back button close what is open, one element at each
> press, the one on top first: the "About" window, the map menu, the window
> opened from a place, the sheet of a spot, the sheet of a place, the list of a
> kind of places, then the search. The
> back button leaves the app only when nothing is open.

## Rule: Escape closes the element on top, and nothing else

### Scenario: A sheet is open

- Given the visitor has opened the "spot"
- When the visitor presses Escape
- Then the "spot" is closed

### Scenario: Two elements are open

- Given the visitor has opened the "kind list"
- And the visitor has opened the "spot"
- When the visitor presses Escape
- Then the "kind list" is still open

### Scenario: Nothing is open

- When the visitor presses Escape
- Then the visitor is still in the app

## Rule: The back button closes the element on top, and nothing else

### Scenario: A sheet is open

- Given the visitor has opened the "spot"
- When the visitor presses the back button
- Then the "spot" is closed

### Scenario: The back button does not leave the app while something is open

- Given the visitor has opened the "about"
- When the visitor presses the back button
- Then the visitor is still in the app

### Scenario: Two elements are open

- Given the visitor has opened the "kind list"
- And the visitor has opened the "spot"
- When the visitor presses the back button
- Then the "kind list" is still open

### Scenario: The back button closes the second element at the second press

- Given the visitor has opened the "kind list"
- And the visitor has opened the "spot"
- When the visitor presses the back button
- And the visitor presses the back button
- Then the "kind list" is closed

### Scenario: The visitor is still in the app once everything is closed

- Given the visitor has opened the "kind list"
- And the visitor has opened the "spot"
- When the visitor presses the back button
- And the visitor presses the back button
- Then the visitor is still in the app

## Rule: The back button leaves the app when nothing is open

### Scenario: Nothing was opened

- When the visitor presses the back button
- Then the visitor has left the app

### Scenario: Everything was closed with the back button

- Given the visitor has opened the "map menu"
- When the visitor presses the back button
- And the visitor presses the back button
- Then the visitor has left the app

### Scenario: Everything was closed with Escape

- Given the visitor has opened the "search"
- When the visitor presses Escape
- And the visitor presses the back button
- Then the visitor has left the app

### Scenario: Everything was closed with a close button

- Given the visitor has opened the "spot"
- When the visitor closes the "spot" with its own button
- And the visitor presses the back button
- Then the visitor has left the app

## Rule: Elements close in order, whatever the order they were opened in

### Scenario: The "About" window closes first

- Given the visitor has opened the "about"
- And the visitor has opened the "map menu"
- When the visitor presses Escape
- Then the "about" is closed

### Scenario: The map menu closes before a sheet

- Given the visitor has opened the "map menu"
- And the visitor has opened the "spot"
- When the visitor presses Escape
- Then the "spot" is still open

### Scenario: The window opened from a place closes before its sheet

- Given the visitor has opened the "place"
- And the visitor has opened the "place window"
- When the visitor presses Escape
- Then the "place" is still open

### Scenario: The sheet of a spot closes before the list of a kind

- Given the visitor has opened the "spot"
- And the visitor has opened the "kind list"
- When the visitor presses the back button
- Then the "kind list" is still open

### Scenario: The sheet of a place closes before the list of a kind

- Given the visitor has opened the "kind list"
- And the visitor has opened the "place"
- When the visitor presses Escape
- Then the "kind list" is still open

### Scenario: The sheet of a district closes before the list of a kind

- Given the visitor has opened the "kind list"
- And the visitor has opened the "district"
- When the visitor presses Escape
- Then the "kind list" is still open

### Scenario: The sheet of a spot closes before the sheet of a place

- Given the visitor has opened the "spot"
- And the visitor has opened the "place"
- When the visitor presses the back button
- Then the "place" is still open

### Scenario: The search closes last

- Given the visitor has opened the "search"
- And the visitor has opened the "kind list"
- When the visitor presses the back button
- Then the "search" is still open

## Rule: The app adds one entry to the history while something is open

### Scenario: One element is open

- When the visitor has opened the "spot"
- Then the app has added 1 entry to the history

### Scenario: A second element above adds no entry

- Given the visitor has opened the "spot"
- When the visitor has opened the "map menu"
- Then the app has added 1 entry to the history

### Scenario: The entry goes when everything is closed another way

- Given the visitor has opened the "spot"
- When the visitor closes the "spot" with its own button
- Then the app has added 0 entry to the history

### Scenario: An entry stays while something is still open after the back button

- Given the visitor has opened the "spot"
- And the visitor has opened the "map menu"
- When the visitor presses the back button
- Then the app has added 1 entry to the history
