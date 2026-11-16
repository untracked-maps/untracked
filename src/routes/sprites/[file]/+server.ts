import { error } from '@sveltejs/kit';
import { basemapSprite } from '#features/map/abilities/show-map/implementation/openfreemap/style/sprite-icons';
import { spriteFile, spriteFileNames } from '#libraries/map-sprite/sprite-files';
import type { EntryGenerator, RequestHandler } from './$types';

const NOT_FOUND = 404;

export const prerender: boolean = true;

export const entries: EntryGenerator = () => spriteFileNames(basemapSprite).map((file) => ({ file }));

export const GET: RequestHandler = async ({ params }) => {
  const file = await spriteFile(basemapSprite, params.file);
  if (!file) {
    error(NOT_FOUND);
  }
  return new Response(file.body, { headers: { 'content-type': file.type } });
};
