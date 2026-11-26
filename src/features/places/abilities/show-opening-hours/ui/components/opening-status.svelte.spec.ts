import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { HoursView } from '../../domain/show-opening-hours';
import OpeningStatus from './opening-status.svelte';

const OPEN: HoursView = {
  status: 'known',
  week: [],
  now: { state: 'open', closes: { day: 'today', at: { hour: 19, minute: 0 } } }
};

const CLOSED: HoursView = { status: 'known', week: [], now: { state: 'closed' } };

const UNCERTAIN: HoursView = { status: 'known', week: [], now: { state: 'uncertain' } };

const shown = async (view: HoursView): Promise<HTMLElement> =>
  (await render(OpeningStatus, { hours: of(view), locale: 'en' })).container;

const textsOf = (container: HTMLElement): readonly (string | null)[] =>
  [...container.querySelectorAll('dt, dd')].map((element) => element.textContent);

const colourOf = (container: HTMLElement): string | undefined => {
  const value = container.querySelector('dt + dd');
  return value === null ? undefined : getComputedStyle(value).color;
};

describe('the hours column of the strip', () => {
  it('says whether the place is open, then when it changes', async () => {
    expect(textsOf(await shown(OPEN))).toEqual(['Opening hours', 'Open', 'closes at 19:00']);
  });

  it('says a closed place with no change ahead in one word', async () => {
    expect(textsOf(await shown(CLOSED))).toEqual(['Opening hours', 'Closed']);
  });

  it('writes an open place in green', async () => {
    expect(colourOf(await shown(OPEN))).toBe('rgb(24, 132, 61)');
  });

  it('writes a closed place in red', async () => {
    expect(colourOf(await shown(CLOSED))).toBe('rgb(197, 34, 31)');
  });

  it('writes uncertain hours in the colour of the text', async () => {
    expect(colourOf(await shown(UNCERTAIN))).toBe('rgb(28, 29, 31)');
  });

  it('shows no column without hours', async () => {
    expect((await shown({ status: 'none' })).querySelector('div')).toBeNull();
  });
});
