import { firstValueFrom, lastValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import type { RecentPlace } from '../../domain/recent-searches';
import { localRecents } from './local-recents';

const KEY = 'untracked-maps.recent-searches';

const LOUVRE: RecentPlace = {
  id: 'musee-du-louvre',
  name: 'Musée du Louvre',
  kind: 'museum',
  address: { houseNumber: '99', street: 'Rue de Rivoli', postalCode: '75001', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: { longitude: 2.337_64, latitude: 48.860_61 }
};

type FakeStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> & { readonly values: Map<string, string> };

const fakeStorage = (entries: Readonly<Record<string, string>> = {}): FakeStorage => {
  const values = new Map(Object.entries(entries));
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value): void => {
      values.set(key, value);
    },
    removeItem: (key): void => {
      values.delete(key);
    }
  };
};

const storedWith = (value: unknown): FakeStorage => fakeStorage({ [KEY]: JSON.stringify(value) });

const readFrom = (storage: FakeStorage): Promise<readonly RecentPlace[]> =>
  firstValueFrom(localRecents(storage).storedRecents());

describe('local recent searches', () => {
  it('are none on a first visit', async () => {
    expect(await readFrom(fakeStorage())).toEqual([]);
  });

  it('read the places kept by an earlier visit', async () => {
    expect(await readFrom(storedWith([LOUVRE]))).toEqual([LOUVRE]);
  });

  it('read the device when asked, not before', async () => {
    const storage = fakeStorage();
    const recents$ = localRecents(storage).storedRecents();
    storage.setItem(KEY, JSON.stringify([LOUVRE]));

    expect(await firstValueFrom(recents$)).toEqual([LOUVRE]);
  });
});

describe('local recent searches kept by another version', () => {
  it('are none when what is kept is not JSON', async () => {
    expect(await readFrom(fakeStorage({ [KEY]: '[{' }))).toEqual([]);
  });

  it('are none when what is kept is not a list', async () => {
    expect(await readFrom(storedWith({ 0: LOUVRE }))).toEqual([]);
  });

  it('skip what is not a place', async () => {
    expect(await readFrom(storedWith([null, 'Louvre', LOUVRE]))).toEqual([LOUVRE]);
  });

  it('skip a place without an id', async () => {
    expect(await readFrom(storedWith([{ ...LOUVRE, id: 7 }]))).toEqual([]);
  });

  it('skip a place without a name', async () => {
    expect(await readFrom(storedWith([{ ...LOUVRE, name: undefined }]))).toEqual([]);
  });

  it('skip a place without an address', async () => {
    expect(await readFrom(storedWith([{ ...LOUVRE, address: null }]))).toEqual([]);
  });
});

describe('local recent searches kept with an address', () => {
  it('skip a place whose address is one line, as an earlier version kept it', async () => {
    expect(await readFrom(storedWith([{ ...LOUVRE, address: 'Rue de Rivoli, 75001 Paris' }]))).toEqual([]);
  });

  it('skip a place whose address has no postal code', async () => {
    expect(await readFrom(storedWith([{ ...LOUVRE, address: { ...LOUVRE.address, postalCode: undefined } }]))).toEqual([]);
  });

  it('skip a place whose address has no locality', async () => {
    expect(await readFrom(storedWith([{ ...LOUVRE, address: { ...LOUVRE.address, addressLocality: 7 } }]))).toEqual([]);
  });

  it('skip a place whose address has no country', async () => {
    expect(await readFrom(storedWith([{ ...LOUVRE, address: { ...LOUVRE.address, addressCountry: undefined } }]))).toEqual([]);
  });

  it('skip a place whose street is not text', async () => {
    expect(await readFrom(storedWith([{ ...LOUVRE, address: { ...LOUVRE.address, street: 7 } }]))).toEqual([]);
  });

  it('skip a place whose house number is not text', async () => {
    expect(await readFrom(storedWith([{ ...LOUVRE, address: { ...LOUVRE.address, houseNumber: 7 } }]))).toEqual([]);
  });

  it('keep the cuisine of a restaurant', async () => {
    const restaurant: RecentPlace = { ...LOUVRE, kind: 'restaurant', cuisine: 'italian' };

    expect(await readFrom(storedWith([restaurant]))).toEqual([restaurant]);
  });

  it('leave out a cuisine that is not text', async () => {
    expect(await readFrom(storedWith([{ ...LOUVRE, cuisine: 7 }]))).toEqual([LOUVRE]);
  });
});

describe('local recent searches kept with a kind', () => {
  it('skip a place of an unknown kind', async () => {
    expect(await readFrom(storedWith([{ ...LOUVRE, kind: 'volcano' }]))).toEqual([]);
  });

  it('keep an address', async () => {
    const address = { ...LOUVRE, id: 'address-75001-12-rue-de-rivoli', name: '12 Rue de Rivoli', kind: 'address' };

    expect(await readFrom(storedWith([address]))).toEqual([address]);
  });
});

describe('local recent searches kept without coordinates', () => {
  it('skip a place without coordinates', async () => {
    expect(await readFrom(storedWith([{ ...LOUVRE, coordinates: null }]))).toEqual([]);
  });

  it('skip a place whose coordinates are missing', async () => {
    expect(await readFrom(storedWith([{ ...LOUVRE, coordinates: undefined }]))).toEqual([]);
  });

  it('skip a place without a longitude', async () => {
    expect(await readFrom(storedWith([{ ...LOUVRE, coordinates: { latitude: 48.86 } }]))).toEqual([]);
  });

  it('skip a place without a latitude', async () => {
    expect(await readFrom(storedWith([{ ...LOUVRE, coordinates: { longitude: 2.33 } }]))).toEqual([]);
  });
});

describe('local recent searches stored', () => {
  it('keep the places on the device', async () => {
    const storage = fakeStorage();

    await lastValueFrom(localRecents(storage).storeRecents([LOUVRE]));

    expect(await readFrom(storage)).toEqual([LOUVRE]);
  });

  it('leave nothing on the device once cleared', async () => {
    const storage = storedWith([LOUVRE]);

    await lastValueFrom(localRecents(storage).storeRecents([]));

    expect(storage.values.has(KEY)).toBe(false);
  });

  it('write the device when asked, not before', () => {
    const storage = fakeStorage();

    localRecents(storage).storeRecents([LOUVRE]);

    expect(storage.values.has(KEY)).toBe(false);
  });
});
