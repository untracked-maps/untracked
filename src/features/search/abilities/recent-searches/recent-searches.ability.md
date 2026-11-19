# Feature: Recent searches

> The places the visitor chose are kept on this device, the most recent first,
> and offered again as soon as the search field gets the focus. The visitor can
> clear them. They never leave the device.

## Rule: The place chosen comes first

### Scenario: The visitor chooses a place

- Given no recent search on this device
- When the visitor chooses "Musée du Louvre"
- Then the recent searches are "Musée du Louvre"

### Scenario: The visitor chooses another place

- Given no recent search on this device
- When the visitor chooses "Musée du Louvre"
- And the visitor chooses "Tour Eiffel"
- Then the recent searches are "Tour Eiffel, Musée du Louvre"

## Rule: A place is listed once

### Scenario: The visitor chooses a place again

- Given no recent search on this device
- When the visitor chooses "Musée du Louvre"
- And the visitor chooses "Tour Eiffel"
- And the visitor chooses "Musée du Louvre"
- Then the recent searches are "Musée du Louvre, Tour Eiffel"

## Rule: Only the eight most recent places are kept

### Scenario: The visitor chooses a ninth place

- Given the recent searches "Arc de Triomphe, Grand Palais, Gare de Lyon, Panthéon, Opéra Garnier, Musée d'Orsay, Sainte-Chapelle, Centre Pompidou" on this device
- When the visitor chooses "Tour Eiffel"
- Then the recent searches are "Tour Eiffel, Arc de Triomphe, Grand Palais, Gare de Lyon, Panthéon, Opéra Garnier, Musée d'Orsay, Sainte-Chapelle"

## Rule: The recent searches are kept on this device

### Scenario: The visitor comes back

- Given no recent search on this device
- When the visitor chooses "Musée du Louvre"
- And the visitor comes back later
- Then the recent searches are "Musée du Louvre"

## Rule: The visitor can clear them

### Scenario: The visitor clears the recent searches

- Given the recent searches "Musée du Louvre, Tour Eiffel" on this device
- When the visitor clears the recent searches
- And the visitor comes back later
- Then there is no recent search

## Rule: The visitor can take a clearing back

### Scenario: The visitor takes the clearing back

- Given the recent searches "Musée du Louvre, Tour Eiffel" on this device
- When the visitor clears the recent searches
- And the visitor takes the clearing back
- And the visitor comes back later
- Then the recent searches are "Musée du Louvre, Tour Eiffel"

### Scenario: The visitor chooses a place before taking the clearing back

- Given the recent searches "Musée du Louvre, Tour Eiffel" on this device
- When the visitor clears the recent searches
- And the visitor chooses "Panthéon"
- And the visitor takes the clearing back
- Then the recent searches are "Panthéon, Musée du Louvre, Tour Eiffel"

## Rule: The recent searches work on a device that cannot keep them

### Scenario: The device refuses to store them

- Given a device that cannot keep recent searches
- When the visitor chooses "Musée du Louvre"
- Then the recent searches are "Musée du Louvre"
