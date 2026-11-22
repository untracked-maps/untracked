# Feature: Show the map

> The app opens on a map of Paris, drawn from the basemap of its provider,
> unless it is asked for another view. Everything else the app shows sits on
> this map.

## Rule: The map opens on Paris

### Scenario: Opening the app

- Given the basemap of the provider
- When the visitor opens the map
- Then the map is centred on Paris
- And the map shows the city at zoom level 13

## Rule: The map opens on the view it is asked for

### Scenario: Asked for the Eiffel Tower

- Given the basemap of the provider
- And the map is asked to open at zoom level 17 on 48.85837, 2.29448
- When the visitor opens the map
- Then the map is centred on 48.85837, 2.29448
- And the map shows the city at zoom level 17

## Rule: The map shows the basemap of its provider

### Scenario: The provider's basemap is drawn

- Given the basemap of the provider
- When the visitor opens the map
- Then the map shows that basemap

## Rule: The map flies to one place opened, in the middle of what the top bar and the sheet leave visible

### Scenario: A place opens on a phone, above its sheet

- Given a map of 400 by 800 pixels at zoom level 13
- And a top bar down to 72 pixels
- And a sheet 368 pixels tall at the bottom of the map
- When a place opens at 48.86061, 2.33764
- Then the map flies to 48.86061, 2.33764 in 800 ms
- And the place stands 0 pixels right and -148 pixels below the centre of the map
- And the map shows the place at zoom level 16.5

### Scenario: A place opens on a large screen, right of the side panel

- Given a map of 1280 by 800 pixels at zoom level 13
- And a top bar down to 72 pixels
- And a side panel 400 pixels wide, ending 412 pixels from the left of the map
- When a place opens at 48.86061, 2.33764
- Then the place stands 206 pixels right and 36 pixels below the centre of the map

### Scenario: A place opens on a map seen from close by

- Given a map of 400 by 800 pixels at zoom level 18
- When a place opens at 48.86061, 2.33764
- Then the map shows the place at zoom level 18

### Scenario: A district opens whole

- Given a map of 400 by 800 pixels at zoom level 18
- When a district opens at 48.86061, 2.33764
- Then the map shows the place at zoom level 14

## Rule: The map fits several places in what the top bar and the sheet leave visible

### Background:

- Given these places to frame
  | longitude | latitude |
  | 2.29 | 48.84 |
  | 2.35 | 48.87 |
  | 2.31 | 48.88 |

### Scenario: Places fit above a sheet on a phone

- Given a map of 400 by 800 pixels at zoom level 13
- And a top bar down to 72 pixels
- And a sheet 300 pixels tall at the bottom of the map
- When the places are framed
- Then the map fits the places in 700 ms
- And it fits the longitudes from 2.29 to 2.35
- And it fits the latitudes from 48.84 to 48.88
- And it keeps 96 pixels free at the top and 324 at the bottom
- And it keeps 36 pixels free on the left and 36 on the right
- And it goes no closer than zoom level 17

### Scenario: A tall sheet counts for 60 % of the map at most

- Given a map of 400 by 800 pixels at zoom level 13
- And a top bar down to 72 pixels
- And a sheet 600 pixels tall at the bottom of the map
- When the places are framed
- Then it keeps 96 pixels free at the top and 504 at the bottom
- And it keeps 36 pixels free on the left and 36 on the right

### Scenario: Places fit right of the side panel on a large screen

- Given a map of 1280 by 800 pixels at zoom level 13
- And a top bar down to 72 pixels
- And a side panel 400 pixels wide, ending 412 pixels from the left of the map
- When the places are framed
- Then it keeps 60 pixels free at the top and 60 at the bottom
- And it keeps 460 pixels free on the left and 60 on the right

## Rule: The map jumps without flying when the visitor asks for less motion

### Scenario: The move is not essential

- Given a map of 400 by 800 pixels at zoom level 13
- When a place opens at 48.86061, 2.33764
- Then the move can be left out of the animation
