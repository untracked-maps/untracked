# Feature: Find an address

> The visitor types an address, a street or a Paris postcode in the search
> field, such as "12 bd dauphine", "rue de rivoli" or "75011", even with a typo
> or an abbreviation. The house at that number comes first, then its street;
> among streets of the same name, the nearest to the centre of the map. The
> addresses found share the results with the places found by name.

## Rule: A house number and a street give that house first

### Scenario: The visitor types a house number and a street

- Given the address book of the fake Paris
- When the visitor looks up "40 rue mouffetard"
- Then the first result is "40 Rue Mouffetard, 75008 Paris"

### Scenario: The visitor abbreviates the kind of street

- Given the address book of the fake Paris
- When the visitor looks up "12 bd dauphine"
- Then the first result is "12 Boulevard Dauphine, 75005 Paris"

### Scenario: The visitor misspells the street

- Given the address book of the fake Paris
- When the visitor looks up "40 rue moufetard"
- Then the first result is "40 Rue Mouffetard, 75008 Paris"

### Scenario: The visitor types a number the street does not have

- Given the address book of the fake Paris
- When the visitor looks up "99 rue de rivoli"
- Then the first result is "Rue de Rivoli, 75001 Paris"

## Rule: A street gives the nearest street of that name first

### Scenario: The visitor looks up a street from the centre of Paris

- Given the address book of the fake Paris
- When the visitor looks up "rue de rivoli"
- Then the first result is "Rue de Rivoli, 75001 Paris"

### Scenario: The visitor looks up a street from the north-east of Paris

- Given the address book of the fake Paris, around the map centred at longitude 2.45 and latitude 48.91
- When the visitor looks up "rue de rivoli"
- Then the first result is "Rue de Rivoli, 75009 Paris"

### Scenario: The visitor adds a postcode to the street

- Given the address book of the fake Paris
- When the visitor looks up "rue de rivoli 75014"
- Then the first result is "Rue de Rivoli, 75014 Paris"

## Rule: A postcode gives its arrondissement

### Scenario: The visitor types a postcode

- Given the address book of the fake Paris
- When the visitor looks up "75011"
- Then the first result is "Paris 11e Arrondissement, 75011 Paris"

## Rule: Addresses and places share the results

### Scenario: An address found exactly comes without places

- Given the address book of the fake Paris
- And the places "Café Mouffetard" found by name
- When the visitor looks up "40 rue mouffetard"
- Then no place is among the results

### Scenario: An address found with a typo comes first, then three places

- Given the address book of the fake Paris
- And the places "Café Alpha, Café Beta, Café Gamma, Café Delta" found by name
- When the visitor looks up "40 rue moufetard"
- Then the results start with "40 Rue Mouffetard, Café Alpha, Café Beta, Café Gamma, Rue Mouffetard"

### Scenario: Three streets found exactly come before the places

- Given the address book of the fake Paris
- And the places "Square Rivoli" found by name
- When the visitor looks up "rue de rivoli"
- Then the results start with "Rue de Rivoli, Rue de Rivoli, Rue de Rivoli, Square Rivoli, Rue de Rivoli"

### Scenario: The name of a place is not an address

- Given the address book of the fake Paris
- And the places "Tour Eiffel" found by name
- When the visitor looks up "tour eiffel"
- Then the results start with "Tour Eiffel"

### Scenario: A place named after a kind of street comes before streets that do not match

- Given the address book of the fake Paris
- And the places "Square Thierry Martin" found by name
- When the visitor looks up "square thierry martin"
- Then the results start with "Square Thierry Martin"

## Rule: The places are still found when the addresses are not

### Scenario: The addresses cannot be loaded

- Given the address book of the fake Paris cannot be loaded
- And the places "Café Mouffetard" found by name
- When the visitor looks up "40 rue mouffetard"
- Then the results start with "Café Mouffetard"
