import type { FakePlace } from './fake-place';
import { generatedPlaces } from './generated-places';
import { landmarks } from './landmarks';

const GENERATED_PLACES = 2000;

const fakeParis = (): readonly FakePlace[] => [...landmarks(), ...generatedPlaces(GENERATED_PLACES)];

export { fakeParis };
