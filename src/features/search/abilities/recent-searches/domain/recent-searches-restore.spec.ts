import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { type RecentPlace, type RecentPlaces, recentSearches } from './recent-searches';

const placeNamed = (name: string): RecentPlace => {
  const id = name.toLowerCase();
  return { id, name, address: `${name}, Paris`, kind: 'museum', coordinates: { latitude: 48.85, longitude: 2.35 } };
};

const LOUVRE = placeNamed('Louvre');
const ORSAY = placeNamed('Orsay');
const EIGHT: RecentPlaces = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(placeNamed);

type Marbles = {
  readonly chosen?: string;
  readonly cleared?: string;
  readonly restored: string;
};

const recentsAfter = (stored: RecentPlaces, { chosen = '', cleared = '', restored }: Marbles): RecentPlaces =>
  new TestScheduler(() => undefined).run(({ cold, flush }) => {
    const seen: RecentPlaces[] = [];
    const recents$ = recentSearches({ storedRecents: () => of(stored), storeRecents: () => of(undefined) })({
      chosen: cold(chosen, { l: LOUVRE, o: ORSAY }),
      cleared: cold(cleared, { c: undefined }),
      restored: cold(restored, { r: undefined })
    });
    recents$.subscribe((recents) => {
      seen.push(recents);
    });
    flush();
    return seen.at(-1) ?? [];
  });

describe('taking back the clearing of the recent searches', () => {
  it('puts the places cleared back', () => {
    expect(recentsAfter([LOUVRE, ORSAY], { cleared: '-c', restored: '--r' })).toEqual([LOUVRE, ORSAY]);
  });

  it('keeps the places chosen since first', () => {
    expect(recentsAfter([ORSAY], { cleared: '-c', chosen: '--l', restored: '---r' })).toEqual([LOUVRE, ORSAY]);
  });

  it('lists once a place chosen again since', () => {
    expect(recentsAfter([LOUVRE, ORSAY], { cleared: '-c', chosen: '--o', restored: '---r' })).toEqual([ORSAY, LOUVRE]);
  });

  it('keeps the eight most recent places only', () => {
    expect(recentsAfter(EIGHT, { cleared: '-c', chosen: '--l', restored: '---r' })).toEqual([LOUVRE, ...EIGHT.slice(0, 7)]);
  });

  it('changes nothing when nothing was cleared', () => {
    expect(recentsAfter([LOUVRE], { restored: '-r' })).toEqual([LOUVRE]);
  });

  it('puts nothing back a second time', () => {
    expect(recentsAfter([LOUVRE], { cleared: '-c', restored: '--rr' })).toEqual([LOUVRE]);
  });

  it('forgets an earlier clearing once a later one is taken back', () => {
    expect(recentsAfter([LOUVRE], { cleared: '-c', chosen: '---o', restored: '--r--r' })).toEqual([ORSAY, LOUVRE]);
  });
});
