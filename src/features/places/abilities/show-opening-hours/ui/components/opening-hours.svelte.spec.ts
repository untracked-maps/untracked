import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { WeekDay } from '../../domain/opening-hours';
import type { HoursView } from '../../domain/show-opening-hours';
import OpeningHours from './opening-hours.svelte';

const NINE_TO_SEVEN = { kind: 'open', ranges: [{ from: { hour: 9, minute: 0 }, to: { hour: 19, minute: 0 } }] } as const;

const WEEK: readonly WeekDay[] = [
  { weekday: 'monday', today: false, hours: NINE_TO_SEVEN },
  { weekday: 'tuesday', today: true, hours: NINE_TO_SEVEN },
  { weekday: 'wednesday', today: false, hours: NINE_TO_SEVEN },
  { weekday: 'thursday', today: false, hours: NINE_TO_SEVEN },
  { weekday: 'friday', today: false, hours: NINE_TO_SEVEN },
  { weekday: 'saturday', today: false, hours: { kind: 'all day' } },
  { weekday: 'sunday', today: false, hours: { kind: 'closed' } }
];

const KNOWN: HoursView = { status: 'known', week: WEEK, now: { state: 'open' } };

const shown = async (view: HoursView): Promise<void> => {
  await render(OpeningHours, { hours: of(view) });
};

const section = (): ReturnType<typeof page.getByRole> => page.getByRole('region', { name: 'Opening hours' });

const rows = (): readonly string[] =>
  [...(section().query()?.querySelectorAll('tr') ?? [])].map((row) =>
    [...row.children].map((cell) => cell.textContent).join(' | ')
  );

const today = (): Element | null | undefined => section().query()?.querySelector('[aria-current="date"]');

const weightOf = (element: Element | null | undefined): string | undefined =>
  element === null || element === undefined ? undefined : getComputedStyle(element).fontWeight;

describe('the opening hours of a place', () => {
  it('show its week, from Monday to Sunday', async () => {
    await shown(KNOWN);

    expect(rows()).toEqual([
      'Monday | 9:00\u00a0– 19:00',
      'Tuesday | 9:00\u00a0– 19:00',
      'Wednesday | 9:00\u00a0– 19:00',
      'Thursday | 9:00\u00a0– 19:00',
      'Friday | 9:00\u00a0– 19:00',
      'Saturday | Open 24 hours',
      'Sunday | Closed'
    ]);
  });

  it('mark today', async () => {
    await shown(KNOWN);

    expect(today()?.textContent).toContain('Tuesday');
  });

  it('write today in bold', async () => {
    await shown(KNOWN);

    expect(weightOf(today()?.querySelector('th'))).toBe('600');
  });

  it('write the other days in a normal weight', async () => {
    await shown(KNOWN);

    expect(weightOf(section().query()?.querySelector('th'))).toBe('400');
  });

  it('say they are not known yet', async () => {
    await shown({ status: 'unknown' });

    await expect.element(section().getByText('Not known yet.')).toBeVisible();
  });

  it('show nothing when the place has none to show', async () => {
    await shown({ status: 'none' });

    expect(section().query()).toBeNull();
  });

  it('show nothing when they cannot be read', async () => {
    await shown({ status: 'unreadable' });

    expect(section().query()).toBeNull();
  });
});
