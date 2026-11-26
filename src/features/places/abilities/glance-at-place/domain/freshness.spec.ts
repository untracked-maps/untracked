import { describe, expect, it } from 'vitest';
import { freshnessOf } from './freshness';

const NOW = Date.parse('2026-11-26T12:00:00Z');

const DAY = 86_400_000;

const LIMIT = 24 * 2.63e9;

const tags = (...pairs: readonly (readonly [string, string])[]): Readonly<Record<string, string>> => Object.fromEntries(pairs);

const checkedOn = (date: string): Readonly<Record<string, string>> => tags(['check_date', date]);

describe('the freshness of a place', () => {
  it('is verified when its check date is less than 24 months old', () => {
    expect(freshnessOf(checkedOn('2025-03-12'), NOW)).toEqual({ state: 'verified', checked: { year: 2025, month: 3 } });
  });

  it('is not verified when its check date is more than 24 months old', () => {
    expect(freshnessOf(checkedOn('2023-06-02'), NOW)).toEqual({
      state: 'not verified',
      checked: { year: 2023, month: 6 }
    });
  });

  it('is still verified on the last moment of the 24 mean months', () => {
    expect(freshnessOf(checkedOn('2024-01-15'), Date.UTC(2024, 0, 15) + LIMIT)?.state).toBe('verified');
  });

  it('is no longer verified just after the 24 mean months', () => {
    expect(freshnessOf(checkedOn('2024-01-15'), Date.UTC(2024, 0, 15) + LIMIT + 1)?.state).toBe('not verified');
  });

  it('counts from the day of the check', () => {
    expect(freshnessOf(checkedOn('2024-01-15'), Date.UTC(2024, 0, 1) + LIMIT + DAY)?.state).toBe('verified');
  });

  it('counts from the first day of the month of a check written without its day', () => {
    expect(freshnessOf(checkedOn('2024-01'), Date.UTC(2024, 0, 1) + LIMIT + 1)?.state).toBe('not verified');
  });

  it('takes the check date of the opening hours when the place has no other', () => {
    expect(freshnessOf(tags(['check_date:opening_hours', '2026-02-01']), NOW)?.checked).toEqual({ year: 2026, month: 2 });
  });

  it('prefers the check date of the place to that of its opening hours', () => {
    expect(freshnessOf(tags(['check_date', '2025-09-30'], ['check_date:opening_hours', '2026-02-01']), NOW)?.checked).toEqual({
      year: 2025,
      month: 9
    });
  });
});

describe('the freshness of a place it cannot read', () => {
  it('is unknown without a check date', () => {
    expect(freshnessOf(tags(['opening_hours', '24/7']), NOW)).toBeUndefined();
  });

  it('is unknown when the check date cannot be read', () => {
    expect(freshnessOf(checkedOn('mars 2025'), NOW)).toBeUndefined();
  });

  it('is unknown when the check date has text before it', () => {
    expect(freshnessOf(checkedOn('le 2025-03-12'), NOW)).toBeUndefined();
  });

  it('is unknown when the check date has text after it', () => {
    expect(freshnessOf(checkedOn('2025-03-12 ?'), NOW)).toBeUndefined();
  });

  it('is unknown when the month of the check date does not exist', () => {
    expect(freshnessOf(checkedOn('2025-13-01'), NOW)).toBeUndefined();
  });

  it('is unknown when the month of the check date is zero', () => {
    expect(freshnessOf(checkedOn('2025-00-01'), NOW)).toBeUndefined();
  });

  it('is unknown when the day of the check date does not exist', () => {
    expect(freshnessOf(checkedOn('2025-03-32'), NOW)).toBeUndefined();
  });

  it('is unknown when the day of the check date is zero', () => {
    expect(freshnessOf(checkedOn('2025-03-00'), NOW)).toBeUndefined();
  });

  it('reads the last days of a month', () => {
    expect(freshnessOf(checkedOn('2025-03-31'), NOW)?.checked).toEqual({ year: 2025, month: 3 });
  });

  it('reads the twentieth days of a month', () => {
    expect(freshnessOf(checkedOn('2025-10-29'), NOW)?.checked).toEqual({ year: 2025, month: 10 });
  });
});
