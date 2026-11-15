import type { ExpressionSpecification, Feature, StylePropertySpecification } from '@maplibre/maplibre-gl-style-spec';
import { featureFilter, normalizePropertyExpression } from '@maplibre/maplibre-gl-style-spec';
import { describe, expect, it } from 'vitest';
import { dashes, exponentialZoom, fadeIn, isGeometry, isNotTunnel, isOneOf, linearZoom, localName } from './expressions';

const ZOOM_NUMBER: StylePropertySpecification = {
  type: 'number',
  'property-type': 'data-constant',
  expression: { interpolated: true, parameters: ['zoom'] },
  transition: false
};

const ZOOM_COLOUR: StylePropertySpecification = {
  type: 'color',
  'property-type': 'data-constant',
  expression: { interpolated: true, parameters: ['zoom'] },
  transition: false,
  overridable: false
};

const valueAt = (expression: ExpressionSpecification, zoom: number): unknown =>
  normalizePropertyExpression(expression, 'value', ZOOM_NUMBER).evaluate({ zoom });

const colourAt = (expression: ExpressionSpecification, zoom: number): unknown =>
  normalizePropertyExpression(expression, 'value', ZOOM_COLOUR).evaluate({ zoom }).toString();

const keeps = (filter: ExpressionSpecification, type: Feature['type'], properties: Feature['properties']): boolean =>
  featureFilter(filter, 'filter').filter({ zoom: 15 }, { type, properties });

const ROAD_WIDTHS: ExpressionSpecification = exponentialZoom([
  { zoom: 12, value: 0.4 },
  { zoom: 14, value: 1.6 }
]);

describe('zoom expressions', () => {
  it('takes the value of a stop at its zoom', () => {
    expect(valueAt(ROAD_WIDTHS, 14)).toBe(1.6);
  });

  it('keeps the first value below the first stop', () => {
    expect(valueAt(ROAD_WIDTHS, 8)).toBe(0.4);
  });

  it('grows exponentially between two stops', () => {
    expect(valueAt(ROAD_WIDTHS, 13)).toBeCloseTo(0.88);
  });

  it('grows linearly between two stops', () => {
    expect(
      valueAt(
        linearZoom([
          { zoom: 16, value: 0 },
          { zoom: 17, value: 0.6 }
        ]),
        16.5
      )
    ).toBeCloseTo(0.3);
  });

  it('blends colours linearly between two stops', () => {
    expect(
      colourAt(
        linearZoom([
          { zoom: 7, value: '#000000' },
          { zoom: 10, value: '#000000' }
        ]),
        8
      )
    ).toBe('rgba(0,0,0,1)');
  });

  it('is transparent before a fade in starts', () => {
    expect(valueAt(fadeIn({ from: 14, to: 15 }), 14)).toBe(0);
  });

  it('is opaque once a fade in ends', () => {
    expect(valueAt(fadeIn({ from: 14, to: 15 }), 15)).toBe(1);
  });
});

describe('feature expressions', () => {
  it('names a feature in French first', () => {
    expect(keeps(['==', localName, 'Paris FR'], 1, { name: 'Paris', 'name:fr': 'Paris FR' })).toBe(true);
  });

  it('names a feature by its local name without a French one', () => {
    expect(keeps(['==', localName, 'London'], 1, { name: 'London', 'name:latin': 'Londinium' })).toBe(true);
  });

  it('names a feature by its latin name as a last resort', () => {
    expect(keeps(['==', localName, 'Moskva'], 1, { 'name:latin': 'Moskva' })).toBe(true);
  });

  it('keeps a feature whose property is one of the listed values', () => {
    expect(keeps(isOneOf('class', ['minor', 'service']), 2, { class: 'service' })).toBe(true);
  });

  it('drops a feature whose property is not one of the listed values', () => {
    expect(keeps(isOneOf('class', ['minor', 'service']), 2, { class: 'primary' })).toBe(false);
  });

  it('drops tunnels', () => {
    expect(keeps(isNotTunnel, 2, { brunnel: 'tunnel' })).toBe(false);
  });

  it('keeps bridges', () => {
    expect(keeps(isNotTunnel, 2, { brunnel: 'bridge' })).toBe(true);
  });

  it('keeps a feature of the given geometry', () => {
    expect(keeps(isGeometry('Polygon'), 3, {})).toBe(true);
  });

  it('drops a feature of another geometry', () => {
    expect(keeps(isGeometry('Polygon'), 2, {})).toBe(false);
  });

  it('draws dashes then gaps', () => {
    expect(dashes({ dash: 3, gap: 2 })).toStrictEqual([3, 2]);
  });
});
