import { defer, type Observable, of } from 'rxjs';
import { ADDRESS_KINDS, type AddressKind } from '../../../../domain/found';
import { type Coordinates, PLACE_KINDS, type PlaceKind } from '../../../../domain/place';
import type { RecentPlace, RecentPlaces, StoredRecents, StoreRecents } from '../../domain/recent-searches';

const RECENTS_KEY = 'untracked-maps.recent-searches';

type RecentsStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

type LocalRecents = {
  readonly storedRecents: StoredRecents;
  readonly storeRecents: StoreRecents;
};

type Fields = Readonly<Record<string, unknown>>;

const isObject = (value: unknown): value is Fields => typeof value === 'object' && value !== null;

const KINDS: readonly unknown[] = [...PLACE_KINDS, ...ADDRESS_KINDS];

const isKnownKind = (value: unknown): value is PlaceKind | AddressKind => KINDS.includes(value);

const isCoordinates = (value: unknown): value is Coordinates =>
  isObject(value) && typeof value['longitude'] === 'number' && typeof value['latitude'] === 'number';

const hasTexts = (value: Fields): boolean =>
  typeof value['id'] === 'string' && typeof value['name'] === 'string' && typeof value['address'] === 'string';

const isRecentPlace = (value: unknown): value is RecentPlace =>
  isObject(value) && hasTexts(value) && isKnownKind(value['kind']) && isCoordinates(value['coordinates']);

const parsed = (text: string | null): unknown => {
  try {
    return JSON.parse(String(text));
  } catch {
    return {};
  }
};

const recentsIn = (text: string | null): RecentPlaces => {
  const value = parsed(text);
  return Array.isArray(value) ? value.filter(isRecentPlace) : [];
};

const kept = (storage: RecentsStorage, recents: RecentPlaces): void =>
  recents.length === 0 ? storage.removeItem(RECENTS_KEY) : storage.setItem(RECENTS_KEY, JSON.stringify(recents));

const localRecents = (storage: RecentsStorage): LocalRecents => ({
  storedRecents: (): Observable<RecentPlaces> => defer(() => of(recentsIn(storage.getItem(RECENTS_KEY)))),
  storeRecents: (recents): Observable<void> =>
    defer(() => {
      kept(storage, recents);
      return of(undefined);
    })
});

export { localRecents };
