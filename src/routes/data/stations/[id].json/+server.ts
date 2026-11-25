import { error } from '@sveltejs/kit';
import { FAKE_STATIONS } from '#configuration/fake-stations';
import type { EntryGenerator, RequestHandler } from './$types';

const NOT_FOUND = 404;

export const prerender: boolean = true;

export const entries: EntryGenerator = () => FAKE_STATIONS.map(({ id }) => ({ id }));

export const GET: RequestHandler = ({ params }) => {
  const station = FAKE_STATIONS.find(({ id }) => id === params.id);
  if (station === undefined) {
    error(NOT_FOUND);
  }
  return Response.json(station);
};
