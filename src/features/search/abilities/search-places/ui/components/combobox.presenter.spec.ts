import { BehaviorSubject, firstValueFrom, from, lastValueFrom, NEVER, of, ReplaySubject, Subject, take } from 'rxjs';
import { describe, expect, it } from 'vitest';
import type { Place } from '../../domain/place';
import type { SearchState } from '../../domain/search-places';
import { activePlaceOf, type Combobox, type ComboboxEvent, comboboxOf, isExpanded, optionsOf } from './combobox.presenter';

const place = (id: string): Place => ({
  id,
  name: `Place ${id}`,
  kind: 'museum',
  address: '',
  coordinates: { longitude: 2.35, latitude: 48.85 },
  fame: 0
});

const FIRST = place('first');
const SECOND = place('second');
const THIRD = place('third');
const FOUND: SearchState = { kind: 'found', query: 'place', places: [FIRST, SECOND, THIRD] };
const TYPED: ComboboxEvent = { kind: 'typed', text: 'place' };
const DOWN: ComboboxEvent = { kind: 'moved', step: 1 };
const UP: ComboboxEvent = { kind: 'moved', step: -1 };

const comboboxAfter = (state: SearchState, events: readonly ComboboxEvent[]): Promise<Combobox> =>
  lastValueFrom(comboboxOf(of(state), from(events)));

describe('combobox', () => {
  it('starts empty and closed', async () => {
    expect(await lastValueFrom(comboboxOf(NEVER, NEVER).pipe(take(1)))).toEqual({
      text: '',
      open: false,
      active: -1,
      state: { kind: 'idle' }
    });
  });

  it('keeps the text typed', async () => {
    expect((await comboboxAfter(FOUND, [TYPED])).text).toBe('place');
  });

  it('opens once the visitor types', async () => {
    expect(isExpanded(await comboboxAfter(FOUND, [TYPED]))).toBe(true);
  });

  it('stays closed while nothing is found', async () => {
    expect(isExpanded(await comboboxAfter({ kind: 'not-found', query: 'place' }, [TYPED]))).toBe(false);
  });

  it('offers the places found', async () => {
    expect(optionsOf(await comboboxAfter(FOUND, [TYPED]))).toEqual([FIRST, SECOND, THIRD]);
  });

  it('offers nothing while searching', async () => {
    expect(optionsOf(await comboboxAfter({ kind: 'searching', query: 'place' }, [TYPED]))).toEqual([]);
  });

  it('has no active option once the visitor types', async () => {
    expect(activePlaceOf(await comboboxAfter(FOUND, [TYPED]))).toBeUndefined();
  });
});

describe('combobox arrow keys', () => {
  it('make the first option active going down', async () => {
    expect(activePlaceOf(await comboboxAfter(FOUND, [TYPED, DOWN]))).toBe(FIRST);
  });

  it('make the last option active going up', async () => {
    expect(activePlaceOf(await comboboxAfter(FOUND, [TYPED, UP]))).toBe(THIRD);
  });

  it('move to the next option', async () => {
    expect(activePlaceOf(await comboboxAfter(FOUND, [TYPED, DOWN, DOWN]))).toBe(SECOND);
  });

  it('move to the previous option', async () => {
    expect(activePlaceOf(await comboboxAfter(FOUND, [TYPED, UP, UP]))).toBe(SECOND);
  });

  it('wrap from the last option to the first', async () => {
    expect(activePlaceOf(await comboboxAfter(FOUND, [TYPED, UP, DOWN]))).toBe(FIRST);
  });

  it('wrap from the first option to the last', async () => {
    expect(activePlaceOf(await comboboxAfter(FOUND, [TYPED, DOWN, UP]))).toBe(THIRD);
  });

  it('reopen a closed list on its first option', async () => {
    expect(activePlaceOf(await comboboxAfter(FOUND, [TYPED, DOWN, DOWN, { kind: 'closed' }, DOWN]))).toBe(FIRST);
  });

  it('do nothing while nothing is offered', async () => {
    expect(await comboboxAfter({ kind: 'idle' }, [DOWN])).toEqual({
      text: '',
      open: false,
      active: -1,
      state: { kind: 'idle' }
    });
  });
});

describe('combobox once closed', () => {
  it('closes when the visitor dismisses it', async () => {
    expect(isExpanded(await comboboxAfter(FOUND, [TYPED, { kind: 'closed' }]))).toBe(false);
  });

  it('forgets the active option when closed', async () => {
    expect((await comboboxAfter(FOUND, [TYPED, DOWN, { kind: 'closed' }])).active).toBe(-1);
  });

  it('keeps the text when closed', async () => {
    expect((await comboboxAfter(FOUND, [TYPED, { kind: 'closed' }])).text).toBe('place');
  });

  it('shows the name of the chosen place', async () => {
    expect((await comboboxAfter(FOUND, [TYPED, { kind: 'chosen', place: SECOND }])).text).toBe('Place second');
  });

  it('closes once a place is chosen', async () => {
    expect(isExpanded(await comboboxAfter(FOUND, [TYPED, { kind: 'chosen', place: SECOND }]))).toBe(false);
  });

  it('has no active option once a place is chosen', async () => {
    expect(activePlaceOf(await comboboxAfter(FOUND, [TYPED, DOWN, { kind: 'chosen', place: SECOND }]))).toBeUndefined();
  });
});

describe('combobox when new places are found', () => {
  it('forgets the active option', async () => {
    const states = new BehaviorSubject(FOUND);
    const events = new Subject<ComboboxEvent>();
    const latest = new ReplaySubject<Combobox>(1);
    comboboxOf(states, events).subscribe(latest);
    events.next(TYPED);
    events.next(DOWN);

    states.next(FOUND);

    expect(activePlaceOf(await firstValueFrom(latest))).toBeUndefined();
  });
});
