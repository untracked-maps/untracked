import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getLocale, overwriteGetLocale } from '#i18n/runtime';
import { freshnessText, toldOf } from './place-glance.presenter';

const away = (metres: number): string => toldOf({ kind: 'distance', metres }, 'en').value;

describe('a column of the strip', () => {
  it('names the distance', () => {
    expect(toldOf({ kind: 'distance', metres: 120 }, 'en').label).toBe('Distance');
  });

  it('writes a short distance to the nearest ten metres', () => {
    expect(away(354)).toBe('350 m');
  });

  it('writes a very short distance as ten metres at least', () => {
    expect(away(2)).toBe('10 m');
  });

  it('writes a distance just under 950 metres in metres', () => {
    expect(away(949)).toBe('950 m');
  });

  it('writes a distance from 950 metres in kilometres, with a tenth', () => {
    expect(away(950)).toBe('1.0 km');
  });

  it('rounds a distance in kilometres to the nearest tenth', () => {
    expect(away(1249)).toBe('1.2 km');
  });

  it('writes a distance just under 9.5 kilometres with a tenth', () => {
    expect(away(9449)).toBe('9.4 km');
  });

  it('writes a distance from 9.5 kilometres in whole kilometres', () => {
    expect(away(9500)).toBe('10 km');
  });

  it('rounds a long distance to the nearest kilometre', () => {
    expect(away(12_400)).toBe('12 km');
  });

  it('writes the tenth of a kilometre in the language of the page', () => {
    expect(toldOf({ kind: 'distance', metres: 1240 }, 'fr').value).toBe('1,2 km');
  });
});

describe('a column of the strip about access', () => {
  it('names the wheelchair access', () => {
    expect(toldOf({ kind: 'wheelchair', access: 'yes' }, 'en')).toEqual({ label: 'Wheelchair', value: 'Yes' });
  });

  it('tells a partial wheelchair access', () => {
    expect(toldOf({ kind: 'wheelchair', access: 'limited' }, 'en').value).toBe('Partial');
  });

  it('tells no wheelchair access', () => {
    expect(toldOf({ kind: 'wheelchair', access: 'no' }, 'en').value).toBe('No');
  });

  it('names a free entrance', () => {
    expect(toldOf({ kind: 'entrance', fee: 'free' }, 'en')).toEqual({ label: 'Entrance', value: 'Free' });
  });

  it('tells a paid entrance', () => {
    expect(toldOf({ kind: 'entrance', fee: 'paid' }, 'en').value).toBe('Paid');
  });
});

describe('the freshness line', () => {
  it('tells the month of a recent check', () => {
    expect(freshnessText({ state: 'verified', checked: { year: 2026, month: 3 } }, 'en')).toBe('Info verified in Mar 2026');
  });

  it('tells the year of an old check', () => {
    expect(freshnessText({ state: 'not verified', checked: { year: 2023, month: 6 } }, 'en')).toBe(
      'Info not verified since 2023'
    );
  });
});

const LOCALE = getLocale;

describe('the freshness line in French', () => {
  beforeEach(() => {
    overwriteGetLocale(() => 'fr');
  });

  afterEach(() => {
    overwriteGetLocale(LOCALE);
  });

  it('abbreviates the month', () => {
    expect(freshnessText({ state: 'verified', checked: { year: 2025, month: 1 } }, 'fr')).toBe('Infos vérifiées en janv. 2025');
  });

  it('writes December as the last month', () => {
    expect(freshnessText({ state: 'verified', checked: { year: 2025, month: 12 } }, 'fr')).toBe('Infos vérifiées en déc. 2025');
  });
});
