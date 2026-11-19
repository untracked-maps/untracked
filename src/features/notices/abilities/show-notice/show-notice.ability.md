# Feature: Show a notice

> The app tells the visitor what just happened in a short notice, under the top
> bar, which goes away by itself. A notice may offer one action, such as taking
> back what was just done.

## Rule: A notice shows for three and a half seconds

### Scenario: The visitor still reads a notice after three seconds

- Given the app tells "Link copied"
- When 3 seconds pass
- Then the visitor reads "Link copied"

### Scenario: A notice is gone after four seconds

- Given the app tells "Link copied"
- When 4 seconds pass
- Then the visitor reads no notice

## Rule: A notice that offers an action shows for six seconds

### Scenario: The visitor can still take the action after five seconds

- Given the app tells "Recent places cleared", with the action "Undo"
- When 5 seconds pass
- Then the visitor reads "Recent places cleared"

### Scenario: A notice with an action is gone after seven seconds

- Given the app tells "Recent places cleared", with the action "Undo"
- When 7 seconds pass
- Then the visitor reads no notice

## Rule: A notice goes away once its action is taken

### Scenario: The visitor takes the action

- Given the app tells "Recent places cleared", with the action "Undo"
- When 1 seconds pass
- And the visitor takes the action of the notice
- Then the visitor reads no notice

## Rule: A new notice replaces the one shown, and its time starts over

### Scenario: Something else happens while a notice shows

- Given the app tells "Link copied"
- When 3 seconds pass
- And the app tells "Address copied"
- And 3 seconds pass
- Then the visitor reads "Address copied"
