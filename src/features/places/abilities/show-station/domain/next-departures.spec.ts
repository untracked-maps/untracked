import { describe, expect, it } from 'vitest';
import { type Departure, type Line, nextDepartures } from './next-departures';

const tagged = (entries: readonly (readonly [string, string])[]): Readonly<Record<string, string>> =>
  Object.fromEntries(entries);

const NOW = Date.parse('2026-11-24T10:00:00Z');

const at = (clock: string): string => `2026-11-24T${clock}Z`;

const METRO_4: Line = {
  id: 'm4',
  tags: tagged([
    ['route_master', 'subway'],
    ['ref', '4'],
    ['colour', '#CF009E'],
    ['text_colour', '#FFFFFF']
  ])
};

const line = (id: string, routeMaster: string, ref?: string): Line => ({
  id,
  tags: tagged([['route_master', routeMaster], ...(ref === undefined ? [] : [['ref', ref] as const])])
});

const METRO_10 = line('m10', 'subway', '10');

const RER_B = line('rb', 'train', 'B');

const ORLYVAL = line('ov', 'light_rail', 'ORLYVAL');

const TRAM_3A = line('t3', 'tram', '3a');

const BUS_38 = line('b38', 'bus', '38');

const NO_REF = line('x', 'train');

const LINES = [METRO_4, METRO_10, RER_B, ORLYVAL, TRAM_3A, BUS_38, NO_REF];

const departure = (lineRef: string, clock: string, more: Partial<Departure> = {}): Departure => ({
  lineRef,
  destinationName: 'Terminus',
  aimedDepartureTime: at(clock),
  monitored: false,
  ...more
});

const refsOf = (departures: readonly Departure[]): readonly string[] =>
  nextDepartures(LINES, departures, NOW).map(({ ref }) => ref);

const toldOf = (clock: string): unknown => nextDepartures(LINES, [departure('m4', clock)], NOW)[0]?.times;

describe('the next departures, their times and those left out', () => {
  it('tell a departure due now at platform', () => {
    expect(toldOf('10:00:29')).toEqual([{ told: 'at platform' }]);
  });

  it('tell a departure within an hour in minutes', () => {
    expect(toldOf('10:59:29')).toEqual([{ told: 'minutes', minutes: 59 }]);
  });

  it('tell a departure beyond an hour at its time', () => {
    expect(toldOf('10:59:30')).toEqual([{ told: 'time', at: at('10:59:30') }]);
  });

  it('tell the expected time rather than the aimed one', () => {
    expect(
      nextDepartures(LINES, [departure('m4', '10:02:00', { expectedDepartureTime: at('11:30:00') })], NOW)[0]?.times
    ).toEqual([{ told: 'time', at: at('11:30:00') }]);
  });

  it('leave out buses and unknown lines', () => {
    expect(refsOf([departure('b38', '10:01:00'), departure('unknown', '10:01:00')])).toEqual([]);
  });

  it('leave out a cancelled departure', () => {
    expect(refsOf([departure('m4', '10:01:00', { departureStatus: 'cancelled' })])).toEqual([]);
  });

  it('keep a delayed departure', () => {
    expect(refsOf([departure('m4', '10:01:00', { departureStatus: 'delayed' })])).toEqual(['4']);
  });

  it('leave out a departure gone for more than 30 seconds', () => {
    expect(refsOf([departure('m4', '09:59:29')])).toEqual([]);
  });
});

describe('the next departures, their order and their lines', () => {
  it('order the metro, then trains, light rail and RER, then trams', () => {
    expect(
      refsOf([
        departure('t3', '10:01:00'),
        departure('ov', '10:02:00'),
        departure('rb', '10:03:00'),
        departure('m4', '10:04:00')
      ])
    ).toEqual(['4', 'B', 'ORLYVAL', '3a']);
  });

  it('order lines of a mode by their numbers', () => {
    expect(refsOf([departure('m10', '10:01:00'), departure('m4', '10:02:00')])).toEqual(['4', '10']);
  });

  it('order the directions of a line by their first departure', () => {
    expect(
      nextDepartures(
        LINES,
        [departure('m4', '10:05:00', { destinationName: 'North' }), departure('m4', '10:02:00', { destinationName: 'South' })],
        NOW
      ).map(({ destination }) => destination)
    ).toEqual(['South', 'North']);
  });

  it('show three times at most per line', () => {
    expect(
      nextDepartures(
        LINES,
        ['10:04:00', '10:01:00', '10:03:00', '10:02:00'].map((clock) => departure('m4', clock)),
        NOW
      )[0]?.times
    ).toHaveLength(3);
  });

  it('show twelve lines at most', () => {
    expect(
      nextDepartures(
        LINES,
        Array.from({ length: 13 }, (_, index) => departure('m4', '10:01:00', { destinationName: `D${index}` })),
        NOW
      )
    ).toHaveLength(12);
  });

  it('say a line is in real time when one of its shown departures is', () => {
    expect(
      nextDepartures(LINES, [departure('m4', '10:01:00'), departure('m4', '10:02:00', { monitored: true })], NOW)[0]?.live
    ).toBe(true);
  });

  it('say a line is not in real time when its shown departures are not', () => {
    expect(nextDepartures(LINES, [departure('m4', '10:01:00')], NOW)[0]?.live).toBe(false);
  });

  it('give a line its readable colours and its mode', () => {
    expect(nextDepartures(LINES, [departure('m4', '10:01:00')], NOW)[0]).toEqual({
      ref: '4',
      mode: 'subway',
      destination: 'Terminus',
      colour: '#cf009e',
      textColour: '#ffffff',
      times: [{ told: 'minutes', minutes: 1 }],
      live: false
    });
  });
});

describe('the next departures, more', () => {
  it('give a line its network', () => {
    expect(
      nextDepartures(
        [
          {
            id: 'rb',
            tags: tagged([
              ['route_master', 'train'],
              ['ref', 'B'],
              ['network', 'RER']
            ])
          }
        ],
        [departure('rb', '10:01:00')],
        NOW
      )[0]?.network
    ).toBe('RER');
  });

  it('give a line without number an empty one, before the numbered lines of its mode', () => {
    expect(refsOf([departure('rb', '10:01:00'), departure('x', '10:02:00')])).toEqual(['', 'B']);
  });
});
