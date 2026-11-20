import { FAKE_ZONE } from '#configuration/fake-zone';
import { fakeAddresses } from '#libraries/fake-places/fake-addresses';
import type { RequestHandler } from './$types';

export const prerender: boolean = true;

export const GET: RequestHandler = () => Response.json(fakeAddresses(FAKE_ZONE));
