import { describe, expect, it } from 'vitest';
import { type Departure, type Line, nextDepartures } from './next-departures';

const NOW = Date.parse('2026-11-24T10:00:00Z');

const METRO: Line = {
  id: 'm4',
  tags: Object.fromEntries([
    ['route_master', 'subway'],
    ['ref', '4']
  ])
};

const tagged = (entries: readonly (readonly [string, string])[]): Readonly<Record<string, string>> =>
  Object.fromEntries(entries);

const leaving = (clock: string, destinationName = 'North'): Departure => ({
  lineRef: 'm4',
  destinationName,
  aimedDepartureTime: `2026-11-24T${clock}Z`,
  monitored: false
});

describe('the next departures of one line', () => {
  it('keep a departure gone for 30 seconds exactly', () => {
    expect(nextDepartures([METRO], [leaving('09:59:30')], NOW)).toHaveLength(1);
  });

  it('give one line to the departures of a line toward one destination', () => {
    expect(nextDepartures([METRO], [leaving('10:01:00'), leaving('10:02:00')], NOW)).toHaveLength(1);
  });

  it('keep the times of a line to its own destination', () => {
    expect(nextDepartures([METRO], [leaving('10:01:00', 'North'), leaving('10:02:00', 'South')], NOW)[0]?.times).toEqual([
      { told: 'minutes', minutes: 1 }
    ]);
  });

  it('tell the times of a line in order', () => {
    expect(
      nextDepartures(
        [METRO],
        ['10:03:00', '10:01:00', '10:02:00'].map((clock) => leaving(clock)),
        NOW
      )[0]?.times
    ).toEqual([
      { told: 'minutes', minutes: 1 },
      { told: 'minutes', minutes: 2 },
      { told: 'minutes', minutes: 3 }
    ]);
  });

  it('keep the directions of a line already in order of their first departure', () => {
    expect(
      nextDepartures([METRO], [leaving('10:02:00', 'South'), leaving('10:05:00', 'North')], NOW).map(
        ({ destination }) => destination
      )
    ).toEqual(['South', 'North']);
  });

  it('give a line the colour of its text', () => {
    expect(
      nextDepartures(
        [
          {
            id: 'c',
            tags: tagged([
              ['route_master', 'train'],
              ['ref', 'C'],
              ['colour', '#FFCE00'],
              ['text_colour', '#000000']
            ])
          }
        ],
        [{ ...leaving('10:01:00'), lineRef: 'c' }],
        NOW
      )[0]?.textColour
    ).toBe('#000000');
  });
});
