import { describe, expect, it } from 'vitest';
import { type OpeningStatus, type OsmOpeningHours, readOpeningHours, statusAt, type Where } from './opening-hours';

const PARIS: Where = {
  coordinates: { longitude: 2.3522, latitude: 48.8566 },
  country: 'FR',
  timeZone: 'Europe/Paris'
};

const LOS_ANGELES: Where = {
  coordinates: { longitude: -118.2437, latitude: 34.0522 },
  country: 'US',
  timeZone: 'America/Los_Angeles'
};

const at = (iso: string): number => Date.parse(iso);

const read = (value: string, where: Where = PARIS): OsmOpeningHours => {
  const hours = readOpeningHours(value, where, at('2026-11-24T12:00:00Z'));
  if (hours === undefined) {
    throw new Error(`${value} should be readable`);
  }
  return hours;
};

const statusOf = (value: string, iso: string, where: Where = PARIS): OpeningStatus => statusAt(read(value, where), at(iso));

describe('reading opening hours', () => {
  it.each(['Mo-Fr 09:00-19:00', '24/7', 'Mo-Sa 10:00-19:00; PH off', 'Mo-Su 18:00-02:00', 'off'])('reads %s', (value) => {
    expect(readOpeningHours(value, PARIS, at('2026-11-24T12:00:00Z'))).toBeDefined();
  });

  it.each(['9h-18h sauf dimanche', 'tlj 10h-19h', 'Mo-Fr 09:00-18:00 et Sa matin'])('cannot read %s', (value) => {
    expect(readOpeningHours(value, PARIS, at('2026-11-24T12:00:00Z'))).toBeUndefined();
  });

  it('cannot read public holidays of a country the library does not know', () => {
    expect(
      readOpeningHours('Mo-Fr 09:00-18:00; PH off', { ...PARIS, country: 'ZZ' }, at('2026-11-24T12:00:00Z'))
    ).toBeUndefined();
  });

  it('cannot read public holidays of a place without country', () => {
    expect(
      readOpeningHours('Mo-Fr 09:00-18:00; PH off', { coordinates: PARIS.coordinates }, at('2026-11-24T12:00:00Z'))
    ).toBeUndefined();
  });

  it('reads hours without public holidays of a place without country', () => {
    expect(readOpeningHours('Mo-Fr 09:00-18:00', { coordinates: PARIS.coordinates }, at('2026-11-24T12:00:00Z'))).toBeDefined();
  });
});

describe('the state of a place now', () => {
  it('is open until today at the time it closes', () => {
    expect(statusOf('Mo-Fr 09:00-19:00', '2026-11-24T10:00:00Z')).toEqual({
      state: 'open',
      closes: { day: 'today', at: { hour: 19, minute: 0 } }
    });
  });

  it('is closed until tomorrow at the time it opens', () => {
    expect(statusOf('Mo-Fr 09:30-19:00', '2026-11-24T20:00:00Z')).toEqual({
      state: 'closed',
      opens: { day: 'tomorrow', at: { hour: 9, minute: 30 } }
    });
  });

  it('is open until tonight when it closes after midnight and before six', () => {
    expect(statusOf('Mo-Su 18:00-02:00', '2026-11-24T19:00:00Z')).toEqual({
      state: 'open',
      closes: { day: 'tonight', at: { hour: 2, minute: 0 } }
    });
  });

  it('is closed until tomorrow when it opens on the next day at six', () => {
    expect(statusOf('Mo-Su 06:00-12:00', '2026-11-24T20:00:00Z')).toEqual({
      state: 'closed',
      opens: { day: 'tomorrow', at: { hour: 6, minute: 0 } }
    });
  });

  it('is closed until a day of the week within seven days', () => {
    expect(statusOf('Mo 09:00-12:00', '2026-11-24T10:00:00Z')).toEqual({
      state: 'closed',
      opens: { day: 'weekday', weekday: 'monday', at: { hour: 9, minute: 0 } }
    });
  });

  it('is closed until a Sunday within seven days', () => {
    expect(statusOf('Su 09:00-12:00', '2026-11-24T10:00:00Z')).toEqual({
      state: 'closed',
      opens: { day: 'weekday', weekday: 'sunday', at: { hour: 9, minute: 0 } }
    });
  });

  it('is closed until a date beyond seven days, without hour', () => {
    expect(statusOf('Dec 08 10:00-12:00', '2026-11-24T10:00:00Z')).toEqual({
      state: 'closed',
      opens: { day: 'date', date: { day: 8, month: 12 } }
    });
  });

  it('counts calendar days, not hours', () => {
    expect(statusOf('Mo-Fr 08:00-09:00', '2026-11-24T22:30:00Z')).toEqual({
      state: 'closed',
      opens: { day: 'tomorrow', at: { hour: 8, minute: 0 } }
    });
  });
});

describe('the state of a place with special hours', () => {
  it('is open with no time it closes when it never closes', () => {
    expect(statusOf('24/7', '2026-11-24T10:00:00Z')).toEqual({ state: 'open' });
  });

  it('is closed with no time it opens when it never opens', () => {
    expect(statusOf('off', '2026-11-24T10:00:00Z')).toEqual({ state: 'closed' });
  });

  it('is uncertain when the rule of now is marked unknown', () => {
    expect(statusOf('Mo-Fr 09:00-19:00 unknown', '2026-11-24T10:00:00Z')).toEqual({ state: 'uncertain' });
  });

  it('is closed on a public holiday that France alone has', () => {
    expect(statusOf('Mo-Fr 09:00-18:00; PH off', '2026-05-08T10:00:00Z')).toEqual({
      state: 'closed',
      opens: { day: 'weekday', weekday: 'monday', at: { hour: 9, minute: 0 } }
    });
  });

  it('is closed on a public holiday', () => {
    expect(statusOf('Mo-Fr 09:00-18:00; PH off', '2026-12-25T11:00:00Z')).toEqual({
      state: 'closed',
      opens: { day: 'weekday', weekday: 'monday', at: { hour: 9, minute: 0 } }
    });
  });

  it('follows the time zone of the place, not the clock of the device', () => {
    expect(statusOf('Mo-Fr 09:00-19:00', '2026-11-25T02:00:00Z', LOS_ANGELES)).toEqual({
      state: 'open',
      closes: { day: 'today', at: { hour: 19, minute: 0 } }
    });
  });
});
