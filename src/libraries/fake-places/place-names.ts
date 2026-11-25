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
  theatre: ({ lastName }) => `Théâtre ${lastName}`,
  'fast-food': ({ lastName }) => `Snack ${lastName}`,
  'ice-cream': ({ lastName }) => `Glacier ${lastName}`,
  chocolate: ({ lastName }) => `Chocolaterie ${lastName}`,
  deli: ({ lastName }) => `Traiteur ${lastName}`,
  nightclub: ({ lastName }) => `Le ${lastName} Club`,
  marketplace: ({ firstName, lastName }) => `Marché ${firstName} ${lastName}`,
  greengrocer: ({ lastName }) => `Primeurs ${lastName}`,
  cheese: ({ lastName }) => `Fromagerie ${lastName}`,
  butcher: ({ lastName }) => `Boucherie ${lastName}`,
  wine: ({ lastName }) => `Cave ${lastName}`,
  clothes: ({ firstName }) => `Boutique ${firstName}`,
  newsagent: ({ lastName }) => `Tabac ${lastName}`,
  diy: ({ lastName }) => `Bricolage ${lastName}`,
  'mobile-phone': ({ lastName }) => `Mobile ${lastName}`,
  toys: ({ lastName }) => `Jouets ${lastName}`,
  stationery: ({ lastName }) => `Papeterie ${lastName}`,
  music: ({ lastName }) => `Musique ${lastName}`,
  atm: ({ lastName }) => `Distributeur ${lastName}`,
  bank: ({ lastName }) => `Banque ${lastName}`,
  optician: ({ lastName }) => `Optique ${lastName}`,
  laundry: ({ lastName }) => `Laverie ${lastName}`,
  townhall: ({ firstName, lastName }) => `Mairie annexe ${firstName} ${lastName}`,
  police: ({ lastName }) => `Commissariat ${lastName}`,
  coworking: ({ lastName }) => `Cowork ${lastName}`,
  doctor: ({ firstName, lastName }) => `Cabinet ${firstName} ${lastName}`,
  veterinary: ({ lastName }) => `Clinique vétérinaire ${lastName}`,
  'pet-shop': ({ lastName }) => `Animalerie ${lastName}`,
  'escape-game': ({ lastName }) => `Escape ${lastName}`,
  playground: ({ firstName, lastName }) => `Aire de jeux ${firstName} ${lastName}`,
  'fitness-centre': ({ lastName }) => `Salle ${lastName}`,
  'swimming-pool': ({ firstName, lastName }) => `Piscine ${firstName} ${lastName}`,
  cemetery: ({ lastName }) => `Cimetière ${lastName}`,
  bicycle: ({ lastName }) => `Cycles ${lastName}`,
  fuel: ({ lastName }) => `Station ${lastName}`,
  'charging-station': ({ lastName }) => `Borne ${lastName}`,
  toilets: ({ lastName }) => `Toilettes ${lastName}`,
  'drinking-water': ({ lastName }) => `Fontaine ${lastName}`
};

const placeNameOf = (kind: GeneratedKind, person: Person): string => PLACE_NAMES[kind](person);

export { placeNameOf };
