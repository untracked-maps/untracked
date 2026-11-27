# Feature: Show the street view of a place

> Above the sheet of a place, a thumbnail shows the front of the place, cut
> from a 360° picture taken in the street. Touching it shows the whole
> picture, opened facing the place. The picture is the one the
> OpenStreetMap key `panoramax` names; the picture gives the position and
> the heading of its camera. Unless told otherwise, the image of a picture
> is "street-views/cafe-01.svg".

## Rule: The street view opens facing the place

### Scenario: The camera looks at the place

- Given a picture "p-1" taken at 2.35, 48.85
- And its camera heading 0°
- And a place tagged "p-1" at 2.35, 48.8501
- When the visitor opens its sheet
- Then the street view shows "street-views/cafe-01.svg" facing 0.5 of its width

### Scenario: The place stands to the right of the camera's heading

- Given a picture "p-1" taken at 2.35, 48.85
- And its camera heading 0°
- And a place tagged "p-1" at 2.3501, 48.85
- When the visitor opens its sheet
- Then the street view shows "street-views/cafe-01.svg" facing 0.75 of its width

### Scenario: The place stands behind the camera

- Given a picture "p-1" taken at 2.35, 48.85
- And its camera heading 90°
- And a place tagged "p-1" at 2.3499, 48.85
- When the visitor opens its sheet
- Then the street view shows "street-views/cafe-01.svg" facing 0 of its width

### Scenario: The place stands to the left of the camera's heading

- Given a picture "p-1" taken at 2.35, 48.85
- And its camera heading 90°
- And a place tagged "p-1" at 2.35, 48.8501
- When the visitor opens its sheet
- Then the street view shows "street-views/cafe-01.svg" facing 0.25 of its width

## Rule: Without a readable picture, there is no street view

### Scenario: A place without the key

- Given a picture "p-1" taken at 2.35, 48.85
- And its camera heading 0°
- And a place without a street view at 2.35, 48.8501
- When the visitor opens its sheet
- Then there is no street view

### Scenario: A key that is not a picture's name

- Given a picture "p-1" taken at 2.35, 48.85
- And its camera heading 0°
- And a place tagged "../p-1" at 2.35, 48.8501
- When the visitor opens its sheet
- Then there is no street view

### Scenario: A picture that cannot be read

- Given no picture can be read
- And a place tagged "p-1" at 2.35, 48.8501
- When the visitor opens its sheet
- Then there is no street view

### Scenario: A picture of another site

- Given a picture "p-1" taken at 2.35, 48.85
- And its image is "https://images.example/p-1.jpg"
- And its camera heading 0°
- And a place tagged "p-1" at 2.35, 48.8501
- When the visitor opens its sheet
- Then there is no street view

## Rule: A closed sheet shows no street view

### Scenario: The sheet closes

- Given a picture "p-1" taken at 2.35, 48.85
- And its camera heading 0°
- And a place tagged "p-1" at 2.35, 48.8501
- When the visitor opens its sheet, then closes it
- Then there is no street view
