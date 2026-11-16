import { fakeAddresses } from '#libraries/fake-paris/fake-addresses';
import type { RequestHandler } from './$types';

export const prerender: boolean = true;

export const GET: RequestHandler = () => Response.json(fakeAddresses());
