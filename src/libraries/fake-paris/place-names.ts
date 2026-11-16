import type { GeneratedKind } from './fake-place';

type Person = {
  readonly firstName: string;
  readonly lastName: string;
};

const PLACE_NAMES: Readonly<Record<GeneratedKind, (person: Person) => string>> = {
  restaurant: ({ firstName }) => `Chez ${firstName}`,
  cafe: ({ lastName }) => `Café ${lastName}`,
  bar: ({ lastName }) => `Le Comptoir ${lastName}`,
  bakery: ({ lastName }) => `Boulangerie ${lastName}`,
  pharmacy: ({ lastName }) => `Pharmacie ${lastName}`,
  supermarket: ({ lastName }) => `Supérette ${lastName}`,
  hairdresser: ({ firstName }) => `Salon ${firstName}`,
  'beauty-salon': ({ firstName }) => `Institut ${firstName}`,
  florist: ({ firstName }) => `Fleurs de ${firstName}`,
  bookshop: ({ lastName }) => `Librairie ${lastName}`,
  hotel: ({ lastName }) => `Hôtel ${lastName}`,
  school: ({ firstName, lastName }) => `École ${firstName} ${lastName}`,
  parking: ({ lastName }) => `Parking ${lastName}`,
  park: ({ firstName, lastName }) => `Square ${firstName} ${lastName}`,
  museum: ({ firstName, lastName }) => `Musée ${firstName} ${lastName}`,
  cinema: ({ lastName }) => `Cinéma ${lastName}`,
  library: ({ firstName, lastName }) => `Bibliothèque ${firstName} ${lastName}`,
  'post-office': ({ lastName }) => `La Poste ${lastName}`,
  hospital: ({ firstName, lastName }) => `Hôpital ${firstName} ${lastName}`,
  theatre: ({ lastName }) => `Théâtre ${lastName}`
};

const placeNameOf = (kind: GeneratedKind, person: Person): string => PLACE_NAMES[kind](person);

export { placeNameOf };
