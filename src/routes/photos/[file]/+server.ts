import { error } from '@sveltejs/kit';
import { drawingOf } from '#features/places/ui/components/place-drawings';
import { fakePhotoImage, photoFileOf } from '#libraries/fake-places/fake-photo-image';
import { PHOTO_FILES } from '#libraries/fake-places/fake-photos';
import type { EntryGenerator, RequestHandler } from './$types';

const NOT_FOUND = 404;

export const prerender: boolean = true;

export const entries: EntryGenerator = () => PHOTO_FILES.map((file) => ({ file }));

export const GET: RequestHandler = ({ params }) => {
  const photo = photoFileOf(params.file);
  if (photo === undefined) {
    error(NOT_FOUND);
  }
  return new Response(fakePhotoImage(drawingOf(photo.family), photo.shade), {
    headers: { 'content-type': 'image/svg+xml' }
  });
};
