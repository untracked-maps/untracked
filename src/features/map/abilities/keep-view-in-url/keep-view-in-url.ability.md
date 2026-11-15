# Feature: Keep the view in the URL

> When the visitor moves or zooms the map, the URL keeps the view: its zoom
> and its centre, in the hash, as `#map=zoom/latitude/longitude`. Reloading
> the page or opening a shared link starts the map on that view. A URL with
> no view, or with a view the map cannot show, opens the default view.

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
