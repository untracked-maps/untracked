import type { FakeStation } from '#libraries/fake-places/fake-station';
import { stations } from '#libraries/fake-places/zones/paris/stations';

const FAKE_STATIONS: readonly FakeStation[] = stations();

export { FAKE_STATIONS };
