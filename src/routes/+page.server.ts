import { FAKE_ZONE } from '#configuration/fake-zone';
import type { Located } from '#features/map/abilities/locate-me/domain/locate-me';
import { fakePosition } from '#features/map/abilities/locate-me/implementation/in-memory/fake-position';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (): { readonly position: Located; readonly timeZone: string } => ({
  position: fakePosition(),
  timeZone: FAKE_ZONE.timeZone
});
