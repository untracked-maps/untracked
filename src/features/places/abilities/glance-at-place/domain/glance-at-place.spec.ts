import { firstValueFrom, lastValueFrom, NEVER, type Observable, of, Subject, toArray } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { type Glance, type GlancePlace, glanceAtPlace } from './glance-at-place';

const NOW = Date.parse('2026-11-26T12:00:00Z');

const NOTRE_DAME = { longitude: 2.349_92, latitude: 48.852_97 };

const HOTEL_DE_VILLE = { longitude: 2.352_22, latitude: 48.856_61 };

const PLACE: GlancePlace = { id: 'place', coordinates: NOTRE_DAME };

type Seen = {
  readonly place?: GlancePlace;
  readonly position?: typeof NOTRE_DAME;
  readonly hoursShown?: boolean;
};

const glanceOf = ({ place = PLACE, position, hoursShown = false }: Seen): Promise<Glance> =>
  lastValueFrom(glanceAtPlace({ opened: of(place), position: of(position), hoursShown: of(hoursShown), time: of(NOW) }));

const metresOf = ({ columns }: Glance): number | undefined =>
  columns.flatMap((column) => (column.kind === 'distance' ? [column.metres] : []))[0];

const tagged = (tags: Readonly<Record<string, string>>): Seen => ({ place: { ...PLACE, tags } });

describe('glancing at the place opened', () => {
  it('shows nothing while no place is open', async () => {
    expect(
      await lastValueFrom(
        glanceAtPlace({ opened: of(undefined), position: of(NOTRE_DAME), hoursShown: of(true), time: of(NOW) })
      )
    ).toEqual({ columns: [] });
  });

  it('shows nothing of a place of which nothing is known', async () => {
    expect(await glanceOf({})).toEqual({ columns: [] });
  });

  it('shows the hours when they are shown', async () => {
    expect((await glanceOf({ hoursShown: true })).columns).toEqual([{ kind: 'hours' }]);
  });

  it('shows how far the place is from the visitor', async () => {
    expect(metresOf(await glanceOf({ position: HOTEL_DE_VILLE }))).toBeCloseTo(438.34, 2);
  });

  it('shows no distance without the position of the visitor', async () => {
    expect((await glanceOf({ hoursShown: true })).columns).toEqual([{ kind: 'hours' }]);
  });
});

describe('glancing at the access to the place opened', () => {
  it('shows a full wheelchair access', async () => {
    expect((await glanceOf(tagged({ wheelchair: 'yes' }))).columns).toEqual([{ kind: 'wheelchair', access: 'yes' }]);
  });

  it('shows a partial wheelchair access', async () => {
    expect((await glanceOf(tagged({ wheelchair: 'limited' }))).columns).toEqual([{ kind: 'wheelchair', access: 'limited' }]);
  });

  it('shows no wheelchair access', async () => {
    expect((await glanceOf(tagged({ wheelchair: 'no' }))).columns).toEqual([{ kind: 'wheelchair', access: 'no' }]);
  });

  it('shows nothing of a wheelchair access it cannot read', async () => {
    expect((await glanceOf(tagged({ wheelchair: 'designated' }))).columns).toEqual([]);
  });
});

describe('glancing at the entrance of the place opened', () => {
  it('shows a free entrance', async () => {
    expect((await glanceOf(tagged({ fee: 'no' }))).columns).toEqual([{ kind: 'entrance', fee: 'free' }]);
  });

  it('shows a paid entrance', async () => {
    expect((await glanceOf(tagged({ fee: 'yes' }))).columns).toEqual([{ kind: 'entrance', fee: 'paid' }]);
  });

  it('shows nothing of an entrance it cannot read', async () => {
    expect((await glanceOf(tagged({ fee: 'donation' }))).columns).toEqual([]);
  });
});

describe('glancing at the whole place opened', () => {
  it('puts the hours, the distance, the wheelchair access and the entrance in this order', async () => {
    expect(
      (
        await glanceOf({
          place: { ...PLACE, tags: { fee: 'yes', wheelchair: 'no' } },
          position: NOTRE_DAME,
          hoursShown: true
        })
      ).columns.map(({ kind }) => kind)
    ).toEqual(['hours', 'distance', 'wheelchair', 'entrance']);
  });

  it('says when the place was checked', async () => {
    expect((await glanceOf(tagged(Object.fromEntries([['check_date', '2026-03-04']])))).freshness).toEqual({
      state: 'verified',
      checked: { year: 2026, month: 3 }
    });
  });

  it('shows nothing until it knows what to show', async () => {
    expect(
      await firstValueFrom(glanceAtPlace({ opened: of(PLACE), position: of(undefined), hoursShown: of(true), time: NEVER }))
    ).toEqual({ columns: [] });
  });

  it('lets go of its sources once nobody looks', () => {
    const times = new Subject<number>();
    glanceAtPlace({ opened: of(PLACE), position: of(undefined), hoursShown: of(false), time: times })
      .subscribe()
      .unsubscribe();
    expect(times.observed).toBe(false);
  });

  it('tells a new glance only when it changes', async () => {
    const times = new Subject<number>();
    const glances: Observable<readonly Glance[]> = glanceAtPlace({
      opened: of(PLACE),
      position: of(undefined),
      hoursShown: of(false),
      time: times
    }).pipe(toArray());
    const told = lastValueFrom(glances);
    times.next(NOW);
    times.next(NOW + 60_000);
    times.complete();
    expect(await told).toHaveLength(1);
  });
});
