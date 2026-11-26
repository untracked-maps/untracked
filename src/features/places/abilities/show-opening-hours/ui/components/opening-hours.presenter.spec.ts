import { describe, expect, it } from 'vitest';
import { dayOf, hoursOf } from './opening-hours.presenter';

describe('the hours of a day', () => {
  it('tells a day closed', () => {
    expect(hoursOf({ kind: 'closed' })).toBe('Closed');
  });

  it('tells a day open all day long', () => {
    expect(hoursOf({ kind: 'all day' })).toBe('Open 24 hours');
  });

  it('tells a day whose hours are uncertain', () => {
    expect(hoursOf({ kind: 'uncertain' })).toBe('Uncertain');
  });

  it('tells the hours of a day on the hour', () => {
    expect(hoursOf({ kind: 'open', ranges: [{ from: { hour: 9, minute: 0 }, to: { hour: 19, minute: 0 } }] })).toBe(
      '9:00 – 19:00'
    );
  });

  it('tells the minutes of the hours of a day', () => {
    expect(hoursOf({ kind: 'open', ranges: [{ from: { hour: 9, minute: 5 }, to: { hour: 19, minute: 30 } }] })).toBe(
      '9:05 – 19:30'
    );
  });

  it('tells each range of a day with a break', () => {
    expect(
      hoursOf({
        kind: 'open',
        ranges: [
          { from: { hour: 9, minute: 0 }, to: { hour: 12, minute: 0 } },
          { from: { hour: 14, minute: 0 }, to: { hour: 19, minute: 0 } },
          { from: { hour: 20, minute: 0 }, to: { hour: 2, minute: 0 } }
        ]
      })
    ).toBe('9:00 – 12:00, 14:00 – 19:00, 20:00 – 2:00');
  });
});

describe('the name of a day', () => {
  it.each([
    ['monday', 'Monday'],
    ['tuesday', 'Tuesday'],
    ['wednesday', 'Wednesday'],
    ['thursday', 'Thursday'],
    ['friday', 'Friday'],
    ['saturday', 'Saturday'],
    ['sunday', 'Sunday']
  ] as const)('tells %s', (weekday, name) => {
    expect(dayOf(weekday)).toBe(name);
  });
});
