# Untracked Maps

Current version: 1.16.0

## 🪧 About

Welcome to Untracked Maps, a map of the world built on [OpenStreetMap](https://www.openstreetmap.org) and open data, that does not track you: no account, no analytics, nothing kept about who looks at what.\
The app runs entirely in your browser, from a static site: it reads existing open data and services directly, and nothing passes through a server of ours.\
The project restarted on 2026-11-15 in this repository; the map, search and routes of its first version come back one feature at a time.

## 📑 Table of contents

- 🪧 [About](#-about)
- ✨ [Features](#-features)
- 🔗 [Environments](#-environments)
- 📚 [Documentation](#-documentation)
- 📦 [Content](#-content)
- 🤗 [Contributing](#-contributing)
- 📝 [License](#-license)

## ✨ Features

- A map of Paris on an OpenStreetMap basemap from [OpenFreeMap](https://openfreemap.org), drawn with [MapLibre](https://maplibre.org)
- A page that says who sees what: every external service the browser calls, what it sees and why
- A message when the basemap does not respond, withdrawn as soon as tiles load again
- A search by name over about two thousand places of a fake Paris generated at build time, typos and beginnings of words included, that flies the map to the place chosen
- Addresses, streets and arrondissements of the fake Paris in the same search field ("12 bd dauphine", "rue de rivoli", "75011"), typos and abbreviations included, mixed with the places found by name as the first version did
- The last eight places chosen, kept on the device and offered as soon as the search field gets the focus, until the visitor clears them
- Short notices under the top bar that tell what just happened, with an action to take it back: clearing the recent places can be undone
- A search by kind of place, from chips under the search field or a kind typed in English or in French ("boulangerie", "the nearest pharmacy"), that lists and marks the 25 nearest places of that kind within 3.5 km of the centre of the map
- The places of the fake Paris shown on the map as dots coloured by family, each with a pictogram and its name: the best known from afar, every place up close
- A button that centres the map on the visitor's position, for now a fake one drawn at build time
- A click, a long press or Enter on the map that marks the spot and gives its nearest address, for now a fake one, with a link to report a mistake there on OpenStreetMap
- The view of the map kept in the address, so that a reload or a shared link opens the same place
- A card that welcomes a first visit, says the map does not track the visitor and links to who sees what, never shown again once acknowledged
- English and French, at `/` and `/fr`, with a language switcher
- A banner that suggests the page in the visitor's language, without redirecting
- A light, a dark or the system theme, kept on the device, for the interface and the map
- A satellite view from the aerial photos of [IGN](https://geoservices.ign.fr/bdortho), with the labels of the map on top, and the transit lines of Île-de-France from [Île-de-France Mobilités](https://data.iledefrance-mobilites.fr) and the bike lanes of France, from OpenStreetMap through IGN, as layers; each kept on the device, and fetched only once turned on
- On a phone, the places of a kind and the spot inspected in a sheet along the bottom, dragged between three heights as in the first version, with the round buttons rising above it
- On a larger screen, the same sheet as a panel on the left, under the search field, with the kinds of places on its right
- Round buttons over the map, as in the first version: map type with the theme, zoom, position, and an "About" dialog with privacy, sources, help, languages and credits
- A page for addresses that do not exist

## 🔗 Environments

| Environment | URL                                         |
| ----------- | ------------------------------------------- |
| Production  | https://untracked-maps.github.io/untracked/ |

Every release is published to GitHub Pages, with its documentation under `/docs`.

## 📚 Documentation

- **Architecture**: the dependency graph, the dependency rules and the allowed folders, generated from the code at each release, under [`/docs`](https://untracked-maps.github.io/untracked/docs/) of the site.
- **Features**: the scenarios of every ability, generated from the Gherkin files at each release, under [`/docs/features.html`](https://untracked-maps.github.io/untracked/docs/features.html) of the site.
- **Decisions**: the [architecture decision records](docs/adr) explain why the project is built the way it is.
- **Security**: the [security policy](SECURITY.md) explains how to report a vulnerability privately.
- **Rules of the code**: [`AGENTS.md`](AGENTS.md) lists the rules the code and the tests follow, for people as much as for coding agents.

## 📦 Content

- [src](src): the source of the web app, built with [SvelteKit](https://svelte.dev/docs/kit) as a static site.
  - [routes](src/routes): the pages, where features are put together.
  - [features](src/features): the features of the app, each with its abilities.
  - [libraries](src/libraries): shared technical code, such as the generator of the architecture documentation.
- [messages](messages): the texts of the interface, one file per language.
- [static](static): files served as they are, such as the icon.
- [tests/e2e](tests/e2e): end-to-end tests, run with [Playwright](https://playwright.dev) on the built site.
- [docs/adr](docs/adr): the architecture decision records.
- [.github](.github): the workflows that check, release and publish the app.

## 🤗 Contributing

Bugs, questions and ideas are welcome as [issues](https://github.com/untracked-maps/untracked/issues).\
To work on the project, read the [contributing guide](CONTRIBUTING.md): it explains how to get the project, run it locally and propose a change.

## 📝 License

[AGPL-3.0-only](LICENSE)
