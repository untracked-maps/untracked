# Feature: Suggest the visitor's language

> When the browser prefers a language the site offers, and the page is in
> another one, a banner suggests the page in that language. The visitor
> decides: the site never redirects on its own. Once dismissed, the banner
> does not come back on this device.

## Rule: The banner suggests the first preferred language the site offers

### Scenario: A French browser on the English page

- Given a browser that prefers "fr-FR, en"
- When the visitor opens the page in "en"
- Then the site suggests "fr"

### Scenario: A regional variant matches its language

- Given a browser that prefers "fr-CA"
- When the visitor opens the page in "en"
- Then the site suggests "fr"

### Scenario: A language the site does not offer is skipped

- Given a browser that prefers "de-DE, fr"
- When the visitor opens the page in "en"
- Then the site suggests "fr"

## Rule: No banner when there is nothing to suggest

### Scenario: The page is already in the preferred language

- Given a browser that prefers "fr-FR, en"
- When the visitor opens the page in "fr"
- Then the site suggests nothing

### Scenario: The browser prefers only languages the site does not offer

- Given a browser that prefers "de-DE, es"
- When the visitor opens the page in "en"
- Then the site suggests nothing

## Rule: A dismissed banner does not come back

### Scenario: The visitor dismissed the banner before

- Given a browser that prefers "fr-FR"
- And the visitor dismissed the language suggestion
- When the visitor opens the page in "en"
- Then the site suggests nothing
