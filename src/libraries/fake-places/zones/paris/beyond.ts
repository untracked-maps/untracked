import { isFakePlaceKind } from '../../fake-place';
import type { FakePlaceBeyond } from '../../fake-zone';
import BEYOND_FILE from './beyond.json' with { type: 'json' };

type PlaceBeyond = (typeof BEYOND_FILE)[number];

const isOfKnownKind = (place: PlaceBeyond): place is PlaceBeyond & FakePlaceBeyond => isFakePlaceKind(place.kind);

const beyond = (): readonly FakePlaceBeyond[] => BEYOND_FILE.filter(isOfKnownKind);

export { beyond };
