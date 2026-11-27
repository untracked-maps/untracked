# Feature: Show the photos of a place

> Under the strip of a place, its photos scroll side by side. Touching one
> shows them in full screen. The photos come from the OpenStreetMap key
> `image`, which may hold several addresses separated by semicolons.

## Rule: The photos are those the key `image` names, in its order

### Scenario: A place with three photos

- Given a photographed place tagged "photos/cafe-01.svg;photos/cafe-02.svg;photos/cafe-03.svg"
- When the visitor opens it
- Then its photos are
  | photos/cafe-01.svg |
  | photos/cafe-02.svg |
  | photos/cafe-03.svg |

### Scenario: A place without the key has no photo

- Given a photographed place without the key
- When the visitor opens it
- Then it has no photo

### Scenario: Spaces and empty parts are left out

- Given a photographed place tagged " photos/cafe-01.svg ; ;photos/cafe-02.svg;"
- When the visitor opens it
- Then its photos are
  | photos/cafe-01.svg |
  | photos/cafe-02.svg |

### Scenario: A photo named twice is shown once

- Given a photographed place tagged "photos/cafe-01.svg;photos/cafe-01.svg"
- When the visitor opens it
- Then its photos are
  | photos/cafe-01.svg |

## Rule: Only the photos of the site itself are shown

### Scenario: A photo of another site is left out

- Given a photographed place tagged "https://upload.example/photo.jpg;photos/cafe-01.svg;//cdn.example/photo.jpg"
- When the visitor opens it
- Then its photos are
  | photos/cafe-01.svg |

### Scenario: A photo of another kind of address is left out

- Given a photographed place tagged "data:image/svg+xml,<svg/>;/photos/cafe-01.svg"
- When the visitor opens it
- Then it has no photo

## Rule: A closed sheet shows no photo

### Scenario: The sheet closes

- Given a photographed place tagged "photos/cafe-01.svg"
- When the visitor opens it, then closes it
- Then it has no photo
