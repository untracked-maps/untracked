import { describe, expect, it } from 'vitest';
import { wallClockOf } from './wall-clock';

type WallClock = {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
};

const readOf = (date: Date): WallClock => ({
  year: date.getFullYear(),
  month: date.getMonth() + 1,
  day: date.getDate(),
  hour: date.getHours(),
  minute: date.getMinutes()
});

describe('the wall clock of a time zone', () => {
  it('reads the time of Paris in winter', () => {
    expect(readOf(wallClockOf(Date.parse('2026-11-24T22:30:00Z'), 'Europe/Paris'))).toEqual({
      year: 2026,
      month: 11,
      day: 24,
      hour: 23,
      minute: 30
    });
  });

  it('reads the time of Paris in summer', () => {
    expect(readOf(wallClockOf(Date.parse('2026-07-14T08:05:00Z'), 'Europe/Paris'))).toEqual({
      year: 2026,
      month: 7,
      day: 14,
      hour: 10,
      minute: 5
    });
  });

  it('reads the time of a zone west of Greenwich, on the day before', () => {
    expect(readOf(wallClockOf(Date.parse('2026-11-25T02:15:00Z'), 'America/Los_Angeles'))).toEqual({
      year: 2026,
      month: 11,
      day: 24,
      hour: 18,
      minute: 15
    });
  });

  it('reads midnight as the start of the day', () => {
    expect(readOf(wallClockOf(Date.parse('2026-11-24T23:00:00Z'), 'Europe/Paris'))).toEqual({
      year: 2026,
      month: 11,
      day: 25,
      hour: 0,
      minute: 0
    });
  });

  it('reads the time of the device without a time zone', () => {
    expect(readOf(wallClockOf(Date.parse('2026-11-24T22:30:00Z'), undefined))).toEqual(
      readOf(new Date('2026-11-24T22:30:00Z'))
    );
  });
});
