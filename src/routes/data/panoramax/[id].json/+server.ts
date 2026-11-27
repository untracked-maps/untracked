import { error } from '@sveltejs/kit';
import { FAKE_ZONE } from '#configuration/fake-zone';
import { fakePictures } from '#libraries/fake-places/fake-places';
import { pictureItem } from '#libraries/fake-places/picture-item';
import type { EntryGenerator, RequestHandler } from './$types';

const NOT_FOUND = 404;

const PICTURES = fakePictures(FAKE_ZONE);

export const prerender: boolean = true;

export const entries: EntryGenerator = () => PICTURES.map(({ id }) => ({ id }));

export const GET: RequestHandler = ({ params }) => {
  const picture = PICTURES.find(({ id }) => id === params.id);
  if (picture === undefined) {
    error(NOT_FOUND);
  }
  return Response.json(pictureItem(picture));
};
