import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getLocale, overwriteGetLocale } from '#i18n/runtime';
import type { OpeningStatus } from '../../domain/opening-hours';
import { statusOf } from './opening-status.presenter';

const now = (status: OpeningStatus): ReturnType<typeof statusOf> => statusOf({ status: 'known', week: [], now: status }, 'en');

describe('the status of a place', () => {
  it('says a place is open and when it closes today', () => {
    expect(now({ state: 'open', closes: { day: 'today', at: { hour: 19, minute: 0 } } })).toEqual({
      tone: 'open',
      head: 'Open',
      rest: 'closes at 19:00'
    });
  });

  it('says a place closes tonight', () => {
    expect(now({ state: 'open', closes: { day: 'tonight', at: { hour: 2, minute: 0 } } })?.rest).toBe('closes tonight at 2:00');
  });

  it('says a place is closed and opens tomorrow', () => {
    expect(now({ state: 'closed', opens: { day: 'tomorrow', at: { hour: 9, minute: 30 } } })).toEqual({
      tone: 'closed',
      head: 'Closed',
      rest: 'opens tomorrow at 9:30'
    });
  });

  it('says on which day of the week a place opens', () => {
    expect(now({ state: 'closed', opens: { day: 'weekday', weekday: 'monday', at: { hour: 9, minute: 0 } } })?.rest).toBe(
      'opens Monday at 9:00'
    );
  });

  it('says on which date a place opens, without its hour', () => {
    expect(now({ state: 'closed', opens: { day: 'date', date: { day: 12, month: 3 } } })?.rest).toBe('opens on March 12');
  });

  it('writes the twenty-ninth of February', () => {
    expect(now({ state: 'closed', opens: { day: 'date', date: { day: 29, month: 2 } } })?.rest).toBe('opens on February 29');
  });
});

describe('the status of a place with no change ahead', () => {
  it('says a place that never closes is open all day and night', () => {
    expect(now({ state: 'open' })).toEqual({ tone: 'open', head: 'Open 24 hours' });
  });

  it('says a place that never opens is closed', () => {
    expect(now({ state: 'closed' })).toEqual({ tone: 'closed', head: 'Closed' });
  });

  it('says the hours of the moment are uncertain', () => {
    expect(now({ state: 'uncertain' })).toEqual({ tone: 'neutral', head: 'Uncertain' });
  });

  it('says hours it cannot read are unreadable', () => {
    expect(statusOf({ status: 'unreadable' }, 'en')).toEqual({ tone: 'neutral', head: 'Unreadable' });
  });

  it('says nothing of hours not known yet', () => {
    expect(statusOf({ status: 'unknown' }, 'en')).toBeUndefined();
  });

  it('says nothing of a place without hours', () => {
    expect(statusOf({ status: 'none' }, 'en')).toBeUndefined();
  });
});

const LOCALE = getLocale;

describe('the status of a place in French', () => {
  beforeEach(() => {
    overwriteGetLocale(() => 'fr');
  });

  afterEach(() => {
    overwriteGetLocale(LOCALE);
  });

  it('writes the date in French', () => {
    expect(
      statusOf(
        { status: 'known', week: [], now: { state: 'closed', opens: { day: 'date', date: { day: 12, month: 3 } } } },
        'fr'
      )?.rest
    ).toBe('ouvre le 12 mars');
  });

  it('never cuts an hour at the end of a line', () => {
    expect(
      statusOf(
        { status: 'known', week: [], now: { state: 'open', closes: { day: 'today', at: { hour: 8, minute: 30 } } } },
        'fr'
      )?.rest
    ).toBe('ferme à 8 h 30');
  });
});
