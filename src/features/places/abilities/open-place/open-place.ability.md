# Feature: Open the sheet of a place

> The visitor chooses a place among the suggestions of the search or in the
> list of a kind of places, or touches its dot on the map. Its sheet opens: its name, its type and its
> address, which the visitor can copy. Closing the sheet takes the visitor
> back to where the place was chosen.

## Rule: The sheet tells the place chosen

### Background:

- Given these places to open
  | id     | name                  | kind       | cuisine | house number | street                  | postal code |
  | ------ | --------------------- | ---------- | ------- | ------------ | ----------------------- | ----------- |
  | flore  | Café de Flore         | cafe       |         | 172          | Boulevard Saint-Germain | 75006       |
  | luigi  | Chez Luigi            | restaurant | italian | 12           | Rue de l'Éperon         | 75006       |
  | galant | Square du Vert-Galant |            |         |              |                         |             |

### Scenario: The visitor chooses a café

- When the visitor opens "flore" from the search
- Then the sheet of "Café de Flore" is open
- And its kind is "cafe"
- And its address is "172", "Boulevard Saint-Germain", "75006"

### Scenario: The visitor chooses a restaurant

- When the visitor opens "luigi" from the search
- Then its cuisine is "italian"

### Scenario: The visitor chooses a place without type nor address

- When the visitor opens "galant" from the search
- Then the sheet of "Square du Vert-Galant" is open
- And it has no kind
- And it has no address

### Scenario: The visitor chooses another place

- When the visitor opens "flore" from the search
- And the visitor opens "luigi" from the list of a kind
- Then the sheet of "Chez Luigi" is open

### Scenario: The place is not known

- When the visitor opens "tour-eiffel" from the search
- Then no sheet is open

## Rule: Closing the sheet takes the visitor back to where the place was chosen

### Background:

- Given these places to open
  | id    | name          | kind |
  | ----- | ------------- | ---- |
  | flore | Café de Flore | cafe |

### Scenario: The place was chosen among the suggestions of the search

- When the visitor opens "flore" from the search
- Then the sheet was opened from the search

### Scenario: The place was chosen in the list of a kind

- When the visitor opens "flore" from the list of a kind
- Then the sheet was opened from the list of a kind

### Scenario: The place was touched on the map

- When the visitor opens "flore" from the map
- Then the sheet was opened from the map

### Scenario: The visitor closes the sheet

- When the visitor opens "flore" from the list of a kind
- And the visitor closes the sheet
- Then no sheet is open

## Rule: The map is told where the place opened stands

### Background:

- Given these places to open
  | id    | name          | longitude | latitude |
  | ----- | ------------- | --------- | -------- |
  | flore | Café de Flore | 2.33263   | 48.85404 |
  | luigi | Chez Luigi    | 2.3395    | 48.8547  |

### Scenario: A place opens

- When the visitor opens "flore" from the map
- Then the map is told to show 1 place, the last at 48.85404, 2.33263

### Scenario: Another place opens

- When the visitor opens "flore" from the map
- And the visitor opens "luigi" from the search
- Then the map is told to show 2 places, the last at 48.8547, 2.3395

### Scenario: The sheet closes

- When the visitor opens "flore" from the map
- And the visitor closes the sheet
- Then the map is told to show 1 place, the last at 48.85404, 2.33263

### Scenario: The same place opens again after its sheet was closed

- When the visitor opens "flore" from the map
- And the visitor closes the sheet
- And the visitor opens "flore" from the search
- Then the map is told to show 2 places, the last at 48.85404, 2.33263

## Rule: A link to a place that cannot be found says so

### Background:

- Given these places to open
  | id    | name          | kind |
  | ----- | ------------- | ---- |
  | flore | Café de Flore | cafe |

### Scenario: A link opens a place that is known

- When the visitor opens "flore" from a link at 48.85404, 2.33263
- Then the sheet of "Café de Flore" is open

### Scenario: A link opens a place that is not known

- When the visitor opens "tour-eiffel" from a link at 48.85837, 2.294481
- Then the place is missing, at 48.85837, 2.294481

### Scenario: A link without a view opens a place that is not known

- When the visitor opens "tour-eiffel" from a link without a position
- Then the place is missing, without a point

### Scenario: A link opens a place while the places cannot be loaded

- Given the places to open cannot be loaded
- When the visitor opens "flore" from a link at 48.85404, 2.33263
- Then the place is missing, at 48.85404, 2.33263

## Rule: The sheet opens only once the places are there

### Scenario: The places cannot be loaded

- Given the places to open cannot be loaded
- When the visitor opens "flore" from the search
- Then no sheet is open

## Rule: The visitor copies the address shown

### Scenario: The device copies it

- When the visitor copies "172 Boulevard Saint-Germain, 75006 Paris"
- Then "172 Boulevard Saint-Germain, 75006 Paris" is copied
- And the visitor is told that the address is copied

### Scenario: The device refuses to copy it

- Given the device cannot copy
- When the visitor copies "172 Boulevard Saint-Germain, 75006 Paris"
- Then the visitor is told that the address could not be copied

## Rule: The sheet tells how to reach the place

### Background:

- Given these places to reach
  | id      | name        | phone             | website                     | menu                             | instagram                           | facebook                         |
  | ------- | ----------- | ----------------- | --------------------------- | -------------------------------- | ----------------------------------- | -------------------------------- |
  | procope | Le Procope  | +33 1 99 00 12 34 | https://www.procope.example | https://www.procope.example/menu | https://instagram.example/leprocope | https://facebook.example/procope |
  | galant  | Vert-Galant |                   |                             |                                  |                                     |                                  |

### Scenario: The place has a phone, a website, a menu, Instagram and Facebook

- When the visitor opens "procope" from the search
- Then the place is reached by
  | phone | +33 1 99 00 12 34 |
  | website | https://www.procope.example |
  | menu | https://www.procope.example/menu |
  | instagram | https://instagram.example/leprocope |
  | facebook | https://facebook.example/procope |

### Scenario: The place has no way to be reached

- When the visitor opens "galant" from the search
- Then the place cannot be reached

## Rule: The sheet tells what is good to know, only what the tags of the place say

> The tags are OpenStreetMap's. "Yes" reads `yes`, `only` or `designated`
> where the tag allows them. Of the facts that exclude one another, only the
> first shows. Four facts warn the visitor; every other one reassures.

### Scenario: The place has no tag

- Given a place tagged
  | name | Square du Vert-Galant |
- When the visitor opens "tagged" from the search
- Then nothing is good to know

### Scenario: The place is a historic monument

- Given a place tagged
  | heritage | 2 |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | historic monument | yes |

### Scenario: The place is a historic monument for the French Ministry of Culture

- Given a place tagged
  | heritage:operator | mhs |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | historic monument | yes |

### Scenario: The place has the reference of a historic monument

- Given a place tagged
  | ref:mhs | PA00088801 |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | historic monument | yes |

### Scenario: The place takes contactless payment

- Given a place tagged
  | payment:contactless | yes |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | contactless | yes |

### Scenario: The place takes debit cards

- Given a place tagged
  | payment:debit_cards | yes |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | cards accepted | yes |

### Scenario: The place refuses cards

- Given a place tagged
  | payment:cards | no |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | cards refused | no |

### Scenario: The place refuses credit cards but takes debit cards

- Given a place tagged
  | payment:credit_cards | no |
  | payment:debit_cards | yes |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | cards accepted | yes |

### Scenario: The place refuses debit cards only

- Given a place tagged
  | payment:debit_cards | no |
- When the visitor opens "tagged" from the search
- Then nothing is good to know

### Scenario: The place refuses cash

- Given a place tagged
  | payment:cash | no |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | cash refused | no |

### Scenario: The place takes meal vouchers

- Given a place tagged
  | payment:cheque_dejeuner | yes |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | meal vouchers | yes |

### Scenario: The place has a terrace

- Given a place tagged
  | outdoor_seating | yes |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | terrace | yes |

### Scenario: The place is vegan only, so vegetarian only too

- Given a place tagged
  | diet:vegan | only |
  | diet:vegetarian | only |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | vegan only | yes |

### Scenario: The place is vegetarian only, with vegan dishes

- Given a place tagged
  | diet:vegan | yes |
  | diet:vegetarian | only |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | vegetarian only | yes |

### Scenario: The place has vegan dishes, so vegetarian ones too

- Given a place tagged
  | diet:vegan | designated |
  | diet:vegetarian | yes |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | vegan options | yes |

### Scenario: The place has vegetarian dishes

- Given a place tagged
  | diet:vegetarian | yes |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | vegetarian options | yes |

### Scenario: The place has gluten-free dishes

- Given a place tagged
  | diet:gluten_free | yes |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | gluten free | yes |

### Scenario: The place sells only to take away

- Given a place tagged
  | takeaway | only |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | takeaway only | yes |

### Scenario: The place also sells to take away

- Given a place tagged
  | takeaway | yes |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | takeaway | yes |

### Scenario: The place delivers

- Given a place tagged
  | delivery | yes |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | delivery | yes |

### Scenario: The place requires a reservation

- Given a place tagged
  | reservation | required |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | reservation required | no |

### Scenario: The place recommends a reservation

- Given a place tagged
  | reservation | recommended |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | reservation recommended | yes |

### Scenario: The place takes reservations

- Given a place tagged
  | reservation | yes |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | reservation possible | yes |

### Scenario: The place takes no reservation

- Given a place tagged
  | reservation | no |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | no reservation | yes |

### Scenario: The place has free Wi-Fi

- Given a place tagged
  | internet_access | wlan |
  | internet_access:fee | no |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | free wifi | yes |

### Scenario: The place has Wi-Fi, free or not

- Given a place tagged
  | internet_access | wifi |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | wifi | yes |

### Scenario: The place has a wired access to the internet only

- Given a place tagged
  | internet_access | wired |
- When the visitor opens "tagged" from the search
- Then nothing is good to know

### Scenario: The place is air-conditioned

- Given a place tagged
  | air_conditioning | yes |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | air conditioned | yes |

### Scenario: The place has toilets open to wheelchairs

- Given a place tagged
  | toilets | yes |
  | toilets:wheelchair | yes |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | accessible toilets | yes |

### Scenario: The place has toilets

- Given a place tagged
  | toilets | yes |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | toilets | yes |

### Scenario: The place has a changing table

- Given a place tagged
  | changing_table | yes |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | changing table | yes |

### Scenario: The place welcomes dogs

- Given a place tagged
  | dog | yes |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | dogs welcome | yes |

### Scenario: The place welcomes dogs on a leash

- Given a place tagged
  | dog | leashed |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | dogs on a leash | yes |

### Scenario: The place does not let dogs in

- Given a place tagged
  | dog | no |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | dogs not allowed | no |

### Scenario: The place is self-service

- Given a place tagged
  | self_service | yes |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | self service | yes |

### Scenario: The place sells second-hand goods only

- Given a place tagged
  | second_hand | only |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | second hand | yes |

### Scenario: The place sells organic products only

- Given a place tagged
  | organic | only |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | organic only | yes |

### Scenario: The place sells organic products

- Given a place tagged
  | organic | yes |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | organic products | yes |

### Scenario: The facts come in their order, whatever the order of the tags

- Given a place tagged
  | dog | no |
  | outdoor_seating | yes |
  | payment:contactless | yes |
  | takeaway | yes |
  | internet_access | wlan |
- When the visitor opens "tagged" from the search
- Then it is good to know that
  | contactless | yes |
  | terrace | yes |
  | takeaway | yes |
  | wifi | yes |
  | dogs not allowed | no |

## Rule: The sheet tells the precise type of the place, when its tags tell it

### Scenario: The place is a cathedral

- Given a place tagged
  | amenity | place_of_worship |
  | building | cathedral |
- When the visitor opens "tagged" from the search
- Then its precise type is "cathedral"

### Scenario: A church that became a place to visit is a monument

- Given a place tagged
  | building | church |
  | historic | monument |
  | tourism | attraction |
- When the visitor opens "tagged" from the search
- Then its precise type is "monument"

### Scenario: No tag tells the precise type

- Given a place tagged
  | amenity | bench |
- When the visitor opens "tagged" from the search
- Then it has no precise type

## Rule: The sheet tells the local name of the place, when it is not the name shown

### Scenario: The place has a local name

- Given a place tagged
  | name | 日本文化会館 |
- When the visitor opens "tagged" from the search
- Then its local name is "日本文化会館"

### Scenario: The local name is the name shown

- Given a place tagged
  | name | Lieu |
- When the visitor opens "tagged" from the search
- Then it has no local name

## Rule: The sheet tells about the place in the visitor's language, and cuts a long text

### Scenario: The text is written in the visitor's language

- Given a place tagged
  | description:fr | Une tour de fer. |
  | description:en | An iron tower. |
- When the visitor opens "tagged" from the search
- Then its text in "en" is "An iron tower."

### Scenario: No text is written in the visitor's language

- Given a place tagged
  | description:fr | Une tour de fer. |
- When the visitor opens "tagged" from the search
- Then it has no text in "en"

### Scenario: A text of 180 characters shows whole

- Given a place tagged
  | description:en | This tower of iron was raised for a fair and was to stand for twenty years only. It still stands above the river, and millions of visitors climb it every year to see all the roofs. |
- When the visitor opens "tagged" from the search
- Then its text in "en" shows whole

### Scenario: A text of more than 180 characters is cut

- Given a place tagged
  | description:en | This tower of iron was raised for a fair and was to stand for twenty years only. It still stands above the river, and millions of visitors climb it every year to see all the roofs of the city. |
- When the visitor opens "tagged" from the search
- Then its text in "en" is cut

## Rule: The text comes after the rest for a place expected to have opening hours, and first for any other

### Background:

- Given these places to open
  | id     | name                  | kind     |
  | ------ | --------------------- | -------- |
  | flore  | Café de Flore         | cafe     |
  | arc    | Arc de Triomphe       | monument |
  | nord   | Gare du Nord          | station  |
  | galant | Square du Vert-Galant |          |

### Scenario: A café tells what is good to know first

- When the visitor opens "flore" from the search
- Then its text comes last

### Scenario: A monument tells about itself first

- When the visitor opens "arc" from the search
- Then its text comes first

### Scenario: A station tells about itself before the rest

- When the visitor opens "nord" from the search
- Then its text comes first

### Scenario: A place without a kind tells about itself first

- When the visitor opens "galant" from the search
- Then its text comes first
