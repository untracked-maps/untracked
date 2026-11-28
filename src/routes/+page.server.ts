import { FAKE_ZONE } from '#configuration/fake-zone';
import type { Located } from '#features/map/abilities/locate-me/domain/locate-me';
import { fakePosition } from '#features/map/abilities/locate-me/implementation/in-memory/fake-position';
import type { Area } from '#features/places/domain/coverage';
import type { PageServerLoad } from './$types';
import type { Zone } from './opening-hours';

export const load: PageServerLoad = (): {
  readonly position: Located;
  readonly zone: Zone;
  readonly areas: readonly Area[];
} => ({
  position: fakePosition(),
  zone: { region: FAKE_ZONE.region, timeZone: FAKE_ZONE.timeZone },
  areas: [FAKE_ZONE.bounds]
});
