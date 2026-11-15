# Feature: Choose the theme

> The visitor chooses a light, a dark or the system theme. The system theme
> follows the colour scheme the device prefers, even when it changes. The
> choice is kept on this device, and applies to the interface and to the map.

## Rule: The system theme follows the device

### Scenario: A first visit on a dark device

- Given a device that prefers the "dark" colour scheme
- When the visitor opens the site
- Then the site is shown in the "dark" colour scheme

### Scenario: The device switches to dark

- Given a device that prefers the "light" colour scheme
- And the visitor chose the "system" theme on an earlier visit
- When the visitor opens the site
- And the device switches to the "dark" colour scheme
- Then the site is shown in the "dark" colour scheme

## Rule: A chosen theme wins over the device

### Scenario: The dark theme on a light device

- Given a device that prefers the "light" colour scheme
- When the visitor opens the site
- And the visitor chooses the "dark" theme
- Then the site is shown in the "dark" colour scheme

### Scenario: The light theme stays when the device switches to dark

- Given a device that prefers the "light" colour scheme
- And the visitor chose the "light" theme on an earlier visit
- When the visitor opens the site
- And the device switches to the "dark" colour scheme
- Then the site is shown in the "light" colour scheme

## Rule: The choice is kept on this device

### Scenario: The visitor comes back after choosing the dark theme

- Given a device that prefers the "light" colour scheme
- And the visitor chose the "dark" theme on an earlier visit
- When the visitor opens the site
- Then the site is shown in the "dark" colour scheme
