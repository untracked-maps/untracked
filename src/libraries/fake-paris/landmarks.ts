import { type FakePlace, isFakePlaceKind } from './fake-place';
import LANDMARKS_FILE from './landmarks.json' with { type: 'json' };

type Landmark = (typeof LANDMARKS_FILE)[number];

const isOfKnownKind = (landmark: Landmark): landmark is Landmark & FakePlace => isFakePlaceKind(landmark.kind);

const landmarks = (): readonly FakePlace[] => LANDMARKS_FILE.filter(isOfKnownKind);

export { landmarks };
