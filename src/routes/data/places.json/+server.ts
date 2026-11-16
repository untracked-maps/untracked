import { fakeParis } from '#libraries/fake-paris/fake-paris';
import type { RequestHandler } from './$types';

export const prerender: boolean = true;

export const GET: RequestHandler = () => Response.json(fakeParis());
