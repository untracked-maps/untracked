# Feature: Find an address

> The visitor types an address, a street or a Paris postcode in the search
> field, such as "12 bd dauphine", "rue de rivoli" or "75011", even with a typo
> or an abbreviation. The house at that number comes first, then its street;
> among streets of the same name, the nearest to the centre of the map. The
> addresses found share the results with the places found by name.

## Rule: A house number and a street give that house first

### Background:

- Given these houses in the address book
  | number | street             | postcode | longitude | latitude |
  | ------ | ------------------ | -------- | --------- | -------- |
  | 75     | Rue Mouffetard     | 75018    | 2.3500    | 48.8410  |
  | 40     | Rue Mouffetard     | 75008    | 2.3510    | 48.8420  |
  | 12     | Boulevard Dauphine | 75005    | 2.3400    | 48.8500  |
  | 3      | Rue de Rivoli      | 75001    | 2.3480    | 48.8570  |

### Scenario: The visitor types a house number and a street

- When the visitor looks up "40 rue mouffetard"
- Then the first result is "40 Rue Mouffetard, 75008 Paris"

### Scenario: The visitor abbreviates the kind of street

- When the visitor looks up "12 bd dauphine"
- Then the first result is "12 Boulevard Dauphine, 75005 Paris"

### Scenario: The visitor misspells the street

- When the visitor looks up "40 rue moufetard"
- Then the first result is "40 Rue Mouffetard, 75008 Paris"

### Scenario: The visitor types a number the street does not have

- When the visitor looks up "99 rue de rivoli"
- Then the first result is "Rue de Rivoli, 75001 Paris"

## Rule: A street gives the nearest street of that name first

### Background:

- Given these houses in the address book
  | number | street        | postcode | longitude | latitude |
  | ------ | ------------- | -------- | --------- | -------- |
  | 8      | Rue de Rivoli | 75014    | 2.3200    | 48.8300  |
  | 5      | Rue de Rivoli | 75009    | 2.4400    | 48.9000  |
  | 3      | Rue de Rivoli | 75001    | 2.3480    | 48.8570  |

### Scenario: The visitor looks up a street from the centre of Paris

- When the visitor looks up "rue de rivoli"
- Then the first result is "Rue de Rivoli, 75001 Paris"

### Scenario: The visitor looks up a street from the north-east of Paris

- Given the visitor looks for an address around longitude 2.45 and latitude 48.91
- When the visitor looks up "rue de rivoli"
- Then the first result is "Rue de Rivoli, 75009 Paris"

### Scenario: The visitor adds a postcode to the street

- When the visitor looks up "rue de rivoli 75014"
- Then the first result is "Rue de Rivoli, 75014 Paris"

## Rule: A postcode gives its arrondissement

### Scenario: The visitor types a postcode

- Given these districts in the address book
  | name                     | postcode | longitude | latitude |
  | ------------------------ | -------- | --------- | -------- |
  | Paris 1er Arrondissement | 75001    | 2.3364    | 48.8625  |
  | Paris 11e Arrondissement | 75011    | 2.3801    | 48.8590  |
- When the visitor looks up "75011"
- Then the first result is "Paris 11e Arrondissement, 75011 Paris"

## Rule: Addresses and places share the results

### Background:

- Given these houses in the address book
  | number | street                | postcode | longitude | latitude |
  | ------ | --------------------- | -------- | --------- | -------- |
  | 40     | Rue Mouffetard        | 75008    | 2.3510    | 48.8420  |
  | 3      | Rue de Rivoli         | 75001    | 2.3480    | 48.8570  |
  | 5      | Rue de Rivoli         | 75009    | 2.4400    | 48.9000  |
  | 8      | Rue de Rivoli         | 75014    | 2.3200    | 48.8300  |
  | 2      | Rue de Rivoli         | 75016    | 2.2700    | 48.8600  |
  | 7      | Square Thierry Lefort | 75012    | 2.3900    | 48.8400  |

### Scenario: An address found exactly comes without places

- Given the places "Café Mouffetard" found by name
- When the visitor looks up "40 rue mouffetard"
- Then no place is among the results

### Scenario: An address found with a typo comes first, then three places

- Given the places "Café Alpha, Café Beta, Café Gamma, Café Delta" found by name
- When the visitor looks up "40 rue moufetard"
- Then the results start with "40 Rue Mouffetard, Café Alpha, Café Beta, Café Gamma, Rue Mouffetard"

### Scenario: Three streets found exactly come before the places

- Given the places "Square Rivoli" found by name
- When the visitor looks up "rue de rivoli"
- Then the results start with "Rue de Rivoli, Rue de Rivoli, Rue de Rivoli, Square Rivoli, Rue de Rivoli"

### Scenario: The name of a place is not an address

- Given the places "Tour Eiffel" found by name
- When the visitor looks up "tour eiffel"
- Then the results start with "Tour Eiffel"

### Scenario: A place named after a kind of street comes before streets that do not match

- Given the places "Square Thierry Martin" found by name
- When the visitor looks up "square thierry martin"
- Then the results start with "Square Thierry Martin"

## Rule: The places are still found when the addresses are not

### Scenario: The addresses cannot be loaded

- Given the address book cannot be loaded
- And the places "Café Mouffetard" found by name
- When the visitor looks up "40 rue mouffetard"
- Then the results start with "Café Mouffetard"
