import { FAKE_ZONE } from '#configuration/fake-zone';
import { fakeDistricts } from '#libraries/fake-places/fake-districts';
import type { RequestHandler } from './$types';

export const prerender: boolean = true;

export const GET: RequestHandler = () => Response.json(fakeDistricts(FAKE_ZONE));
