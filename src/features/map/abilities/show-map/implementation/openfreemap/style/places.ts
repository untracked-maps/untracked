import type { ExpressionSpecification, SymbolLayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import { colours } from './colours';
import { exponentialZoom, isOneOf, localName } from './expressions';
import { fonts } from './fonts';
import { fromTiles } from './tiles';

type SymbolLayout = NonNullable<SymbolLayerSpecification['layout']>;

type CityTextSize = {
  readonly zoom: number;
  readonly big: number;
  readonly standard: number;
};

const wideViewMaxZoom = 9.5;

const offsetBesideThePlace = 0.55;

const unranked = 99;

const capital = 2;

const biggestCitiesRank = 3;

const rank: ExpressionSpecification = ['coalesce', ['get', 'rank'], unranked];

const isBigCity: ExpressionSpecification = ['any', ['==', ['get', 'capital'], capital], ['<=', rank, biggestCitiesRank]];

const wideViewPlacement: Pick<SymbolLayout, 'text-anchor' | 'text-offset' | 'symbol-sort-key'> = {
  'text-anchor': ['step', ['zoom'], 'left', wideViewMaxZoom, 'center'],
  'text-offset': ['step', ['zoom'], ['literal', [offsetBesideThePlace, 0]], wideViewMaxZoom, ['literal', [0, 0]]],
  'symbol-sort-key': rank
};

const cityTextSizes: readonly CityTextSize[] = [
  { zoom: 4, big: 13, standard: 11 },
  { zoom: 6, big: 16, standard: 13 },
  { zoom: 9, big: 19, standard: 15 },
  { zoom: 12, big: 23, standard: 18 }
];

const cityTextSize: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['zoom'],
  ...cityTextSizes.flatMap(({ zoom, big, standard }): (number | ExpressionSpecification)[] => [
    zoom,
    ['case', isBigCity, big, standard]
  ])
];

const neighbourhoods: SymbolLayerSpecification = {
  id: 'place-small',
  type: 'symbol',
  ...fromTiles('place'),
  minzoom: 12,
  maxzoom: 17,
  filter: isOneOf('class', ['suburb', 'quarter', 'neighbourhood']),
  layout: {
    'text-field': localName,
    'text-font': fonts.bold,
    'text-size': exponentialZoom([
      { zoom: 12, value: 10.5 },
      { zoom: 16, value: 13 }
    ]),
    'text-transform': 'uppercase',
    'text-letter-spacing': 0.06,
    'text-max-width': 7
  },
  paint: { 'text-color': colours.labelSoft, 'text-halo-color': colours.placeHalo, 'text-halo-width': 1.4 }
};

const towns: SymbolLayerSpecification = {
  id: 'place-town',
  type: 'symbol',
  ...fromTiles('place'),
  minzoom: 7.5,
  maxzoom: 13,
  filter: ['==', ['get', 'class'], 'town'],
  layout: {
    'text-field': localName,
    'text-font': fonts.semibold,
    'text-size': exponentialZoom([
      { zoom: 7.5, value: 11 },
      { zoom: 10, value: 13.5 },
      { zoom: 12, value: 16 }
    ]),
    ...wideViewPlacement
  },
  paint: { 'text-color': colours.label, 'text-halo-color': colours.halo, 'text-halo-width': 1.6 }
};

const cities: SymbolLayerSpecification = {
  id: 'place-city',
  type: 'symbol',
  ...fromTiles('place'),
  maxzoom: 13,
  filter: ['==', ['get', 'class'], 'city'],
  layout: { 'text-field': localName, 'text-font': fonts.bold, 'text-size': cityTextSize, ...wideViewPlacement },
  paint: { 'text-color': colours.label, 'text-halo-color': colours.halo, 'text-halo-width': 2 }
};

const placeLayers: SymbolLayerSpecification[] = [neighbourhoods, towns, cities];

export { placeLayers };
