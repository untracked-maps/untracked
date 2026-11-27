import { FAKE_ZONE } from '#configuration/fake-zone';
import { fakePlaces } from '#libraries/fake-places/fake-places';
import { detailsFile } from '#libraries/fake-places/place-files';
import type { RequestHandler } from './$types';

export const prerender: boolean = true;

export const GET: RequestHandler = () => Response.json(detailsFile(fakePlaces(FAKE_ZONE)));
