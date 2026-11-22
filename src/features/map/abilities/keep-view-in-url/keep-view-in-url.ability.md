# Feature: Keep the view in the URL

> When the visitor moves or zooms the map, the URL keeps the view: its zoom
> and its centre, in the hash, as `#map=zoom/latitude/longitude`. Reloading
> the page or opening a shared link starts the map on that view. A URL with
> no view, or with a view the map cannot show, opens the default view.
> A shared link also names the place or the spot it opens, and the URL
> keeps it as long as the sheet it opened stays open.

## Rule: A link with a view opens the map on that view

### Scenario: A shared link to the Eiffel Tower

- Given a link whose hash is "map=17/48.85837/2.29448"
- When the visitor follows the link
- Then the link asks for zoom level 17 on 48.85837, 2.29448

### Scenario: A view south and west of Greenwich, at a fractional zoom

- Given a link whose hash is "map=12.5/-33.9/-70.6"
- When the visitor follows the link
- Then the link asks for zoom level 12.5 on -33.9, -70.6

## Rule: A link without a valid view opens the default view

### Scenario: A link without a hash

- Given a link whose hash is ""
- When the visitor follows the link
- Then the link asks for no view

### Scenario: A view that is not made of numbers

- Given a link whose hash is "map=17/abc/2.29448"
- When the visitor follows the link
- Then the link asks for no view

### Scenario: A zoom beyond the closest the map can show

- Given a link whose hash is "map=23/48.85837/2.29448"
- When the visitor follows the link
- Then the link asks for no view

### Scenario: A latitude beyond the poles

- Given a link whose hash is "map=17/91/2.29448"
- When the visitor follows the link
- Then the link asks for no view

## Rule: The URL keeps the view once the map settles

### Scenario: The visitor moves to the Eiffel Tower

- When the visitor moves the map to zoom level 17 on 48.85837, 2.29448
- Then the URL hash becomes "map=17/48.85837/2.29448"

### Scenario: Coordinates are kept to half a pixel

- When the visitor moves the map to zoom level 13 on 48.858370123, 2.294481234
- Then the URL hash becomes "map=13/48.85837/2.29448"

### Scenario: The zoom is kept to two decimals

- When the visitor moves the map to zoom level 13.456 on 48.8566, 2.3522
- Then the URL hash becomes "map=13.46/48.8566/2.3522"

## Rule: The URL keeps the view when the visitor steps back in the history

### Scenario: The entry the visitor steps back to gets the view of the map

- When the visitor moves the map to zoom level 17 on 48.85837, 2.29448, then steps back in the history
- Then the URL hash is written again as "map=17/48.85837/2.29448"

## Rule: A shared link opens the place or the spot it names

### Scenario: A link to a place

- Given a link whose hash is "map=17/48.85837/2.294481&place=paris-0001"
- When the visitor follows the link
- Then the link opens the place "paris-0001" at 48.85837, 2.294481

### Scenario: A link to a place without a view

- Given a link whose hash is "place=paris-0001"
- When the visitor follows the link
- Then the link opens the place "paris-0001" without a position

### Scenario: A link to a spot

- Given a link whose hash is "map=17/48.85837/2.294481&point=1"
- When the visitor follows the link
- Then the link opens the spot at 48.85837, 2.294481

### Scenario: A link to a spot without a view

- Given a link whose hash is "point=1"
- When the visitor follows the link
- Then the link opens nothing

### Scenario: A link with a view alone

- Given a link whose hash is "map=17/48.85837/2.294481"
- When the visitor follows the link
- Then the link opens nothing

## Rule: A link to share opens the place or the spot at zoom 17

### Scenario: The visitor shares a place, whatever the zoom on screen

- Given the page "https://example.org/fr#map=12/48/2" is open
- When the visitor shares the place "paris-0001" at 48.8583701, 2.2944813
- Then the link shared is "https://example.org/fr#map=17/48.85837/2.294481&place=paris-0001"

### Scenario: The visitor shares a spot

- Given the page "https://example.org/untracked/" is open
- When the visitor shares the spot at 48.85837, 2.294481
- Then the link shared is "https://example.org/untracked/#map=17/48.85837/2.294481&point=1"

## Rule: The URL keeps a link until the sheet it opened closes

### Scenario: The visitor moves the map while the sheet of the link is open

- When the visitor follows a link to a place, its sheet opens and the map moves to zoom level 16 on 48.8606, 2.3376
- Then the URL hash is not written

### Scenario: The visitor closes the sheet of the link

- When the visitor follows a link to a place, its sheet opens and the map moves to zoom level 16 on 48.8606, 2.3376, then the sheet closes
- Then the URL hash is written as "map=16/48.8606/2.3376"
