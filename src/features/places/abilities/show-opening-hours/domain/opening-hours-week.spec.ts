import { describe, expect, it } from 'vitest';
import { type DayHours, readOpeningHours, type WeekDay, type Where, weekAt } from './opening-hours';

const PARIS: Where = { timeZone: 'Europe/Paris', country: 'FR', coordinates: { latitude: 48.8584, longitude: 2.2945 } };

const VANCOUVER: Where = {
  timeZone: 'America/Vancouver',
  country: 'CA',
  coordinates: { latitude: 49.2827, longitude: -123.1207 }
};

const weekOfPlace = (value: string, iso: string, where: Where = PARIS): readonly WeekDay[] => {
  const hours = readOpeningHours(value, where, Date.parse(iso));
  return hours === undefined ? [] : weekAt(hours, Date.parse(iso));
};

const weekOf = (value: string, iso: string): readonly DayHours[] => weekOfPlace(value, iso).map(({ hours }) => hours);

const CLOSED: DayHours = { kind: 'closed' };

const open = (...ranges: readonly (readonly [number, number, number, number])[]): DayHours => ({
  kind: 'open',
  ranges: ranges.map(([fromHour, fromMinute, toHour, toMinute]) => ({
    from: { hour: fromHour, minute: fromMinute },
    to: { hour: toHour, minute: toMinute }
  }))
});

describe('the week of a place', () => {
  it('starts on Monday, whatever the day', () => {
    expect(weekOfPlace('Mo-Fr 09:00-19:00', '2026-11-29T10:00:00Z').map(({ weekday }) => weekday)).toEqual([
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday'
    ]);
  });

  it('marks today', () => {
    expect(weekOfPlace('Mo-Fr 09:00-19:00', '2026-11-24T10:00:00Z').map(({ today }) => today)).toEqual([
      false,
      true,
      false,
      false,
      false,
      false,
      false
    ]);
  });

  it('gives the hours of each day, with a break', () => {
    expect(weekOf('Mo-Fr 09:00-12:00,14:00-19:30; Sa 10:00-13:00', '2026-11-24T10:00:00Z')).toEqual([
      open([9, 0, 12, 0], [14, 0, 19, 30]),
      open([9, 0, 12, 0], [14, 0, 19, 30]),
      open([9, 0, 12, 0], [14, 0, 19, 30]),
      open([9, 0, 12, 0], [14, 0, 19, 30]),
      open([9, 0, 12, 0], [14, 0, 19, 30]),
      open([10, 0, 13, 0]),
      CLOSED
    ]);
  });

  it('keeps an evening that ends after midnight on the day it began', () => {
    expect(weekOf('Fr 18:00-02:00', '2026-11-24T10:00:00Z')).toEqual([
      CLOSED,
      CLOSED,
      CLOSED,
      CLOSED,
      open([18, 0, 2, 0]),
      CLOSED,
      CLOSED
    ]);
  });

  it('tells a day open all day long', () => {
    expect(weekOf('24/7', '2026-11-24T10:00:00Z')).toEqual(Array.from({ length: 7 }, () => ({ kind: 'all day' })));
  });

  it('tells days open from midnight to midnight as open all day long', () => {
    expect(weekOf('Mo-Fr 00:00-24:00', '2026-11-24T10:00:00Z')).toEqual([
      { kind: 'all day' },
      { kind: 'all day' },
      { kind: 'all day' },
      { kind: 'all day' },
      { kind: 'all day' },
      CLOSED,
      CLOSED
    ]);
  });

  it('tells a day whose hours are marked unknown', () => {
    expect(weekOf('Mo-Fr 09:00-19:00; Sa unknown', '2026-11-24T10:00:00Z')[5]).toEqual({ kind: 'uncertain' });
  });

  it('tells a day whose hours are marked unknown at some times', () => {
    expect(weekOf('Mo-Fr 09:00-19:00 unknown', '2026-11-24T10:00:00Z')[0]).toEqual({ kind: 'uncertain' });
  });

  it('applies the public holidays of the week', () => {
    expect(weekOf('Mo-Fr 09:00-18:00; PH off', '2026-12-23T10:00:00Z')[4]).toEqual(CLOSED);
  });

  it('follows the time zone of the place for today', () => {
    expect(weekOfPlace('Mo-Fr 09:00-19:00', '2026-11-25T02:00:00Z', VANCOUVER).findIndex(({ today }) => today)).toBe(1);
  });
});
