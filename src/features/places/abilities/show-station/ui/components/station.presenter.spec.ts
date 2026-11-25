import { describe, expect, it } from 'vitest';
import type { LineDepartures } from '../../domain/next-departures';
import type { StationView } from '../../domain/show-station';
import { accessText, exitText, lineName, linesServed, toldText } from './station.presenter';

const AT = { longitude: 2.355, latitude: 48.88 };

const line = (ref: string, mode: LineDepartures['mode'], network?: string): LineDepartures => ({
  ref,
  mode,
  ...(network === undefined ? {} : { network }),
  destination: 'Terminus',
  colour: '#5b6573',
  textColour: '#ffffff',
  times: [],
  live: false
});

const open = (departures: Extract<StationView, { status: 'open' }>['departures']): StationView => ({
  status: 'open',
  id: 'nord',
  exits: [],
  departures
});

describe('the name of a line', () => {
  it.each([
    [line('4', 'subway', 'Métro de Paris'), 'Metro 4'],
    [line('B', 'train', 'RER'), 'RER B'],
    [line('H', 'train', 'Transilien'), 'Train H'],
    [line('TER', 'train'), 'Train TER'],
    [line('3a', 'tram'), 'Tram 3a']
  ])('of %o is "%s"', (named, name) => {
    expect(lineName(named)).toBe(name);
  });
});

describe('a departure told', () => {
  it.each([
    [{ told: 'at platform' } as const, 'at platform'],
    [{ told: 'minutes', minutes: 2 } as const, '2 min'],
    [{ told: 'time', at: '2026-11-24T13:20:00Z' } as const, '14:20']
  ])('as %o reads "%s"', (told, text) => {
    expect(toldText(told, 'en')).toBe(text);
  });

  it('beyond an hour reads its hour in Paris with a colon in French', () => {
    expect(toldText({ told: 'time', at: '2026-11-24T13:20:00Z' }, 'fr')).toBe('14:20');
  });
});

describe('an exit told', () => {
  it.each([
    [{ ref: '3', name: 'Rue de Rennes', coordinates: AT }, 'Exit 3 · Rue de Rennes'],
    [{ ref: '3', coordinates: AT }, 'Exit 3'],
    [{ name: 'Rue de Rennes', coordinates: AT }, 'Rue de Rennes'],
    [{ coordinates: AT }, '']
  ])('as %o reads "%s"', (exit, text) => {
    expect(exitText(exit)).toBe(text);
  });

  it.each([
    [{ access: 'accessible', coordinates: AT } as const, 'accessible'],
    [{ access: 'escalator', coordinates: AT } as const, 'escalator'],
    [{ coordinates: AT }, '']
  ])('with %o tells its access as %s', (exit, text) => {
    expect(accessText(exit)).toBe(text);
  });
});

describe('the lines served by a station', () => {
  it('are grouped by mode, each line once, in the order of the departures', () => {
    expect(
      linesServed(
        open({
          status: 'known',
          lines: [line('4', 'subway'), line('7', 'subway'), line('4', 'subway'), line('B', 'train', 'RER')]
        })
      )
    ).toBe('Metro 4, 7 · RER B');
  });

  it.each([
    [{ status: 'none' } as const],
    [open({ status: 'asked' })],
    [open({ status: 'unavailable' })],
    [open({ status: 'known', lines: [] })]
  ])('are not told for %o', (view) => {
    expect(linesServed(view)).toBeUndefined();
  });
});
