# Feature: Welcome the visitor

> On a first visit, a card tells the visitor that the map does not track
> them, with a link to the page that says who sees what. Once the visitor
> has acknowledged it, the card does not come back on this device.

## Rule: A first visit is welcomed

### Scenario: The visitor comes for the first time

- Given a visitor who never acknowledged the welcome
- When the visitor comes to the site
- Then the site welcomes the visitor

## Rule: An acknowledged welcome does not come back

### Scenario: The visitor acknowledges the welcome

- Given a visitor who never acknowledged the welcome
- When the visitor comes to the site
- And the visitor acknowledges the welcome
- Then the site no longer welcomes the visitor

### Scenario: The visitor acknowledged the welcome on an earlier visit

- Given a visitor who acknowledged the welcome before
- When the visitor comes to the site
- Then the site no longer welcomes the visitor
