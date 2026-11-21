import { error } from '@sveltejs/kit';
import { basemapSprite } from '#features/map/abilities/show-map/implementation/openfreemap/style/sprite-icons';
import { placeDotIcons } from '#features/places/abilities/show-places/ui/components/place-dot-icons';
import { spriteFile, spriteFileNames } from '#libraries/map-sprite/sprite-files';
import type { EntryGenerator, RequestHandler } from './$types';

const NOT_FOUND = 404;

const mapSprite = { name: basemapSprite.name, icons: [...basemapSprite.icons, ...placeDotIcons] };

export const prerender: boolean = true;

export const entries: EntryGenerator = () => spriteFileNames(mapSprite).map((file) => ({ file }));

export const GET: RequestHandler = async ({ params }) => {
  const file = await spriteFile(mapSprite, params.file);
  if (!file) {
    error(NOT_FOUND);
  }
  return new Response(file.body, { headers: { 'content-type': file.type } });
};
