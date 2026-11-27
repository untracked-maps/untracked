import { drawingOf } from '#features/places/ui/components/place-drawings';
import { FAKE_IMAGE_ENTRIES, fakeImageFile } from '#libraries/fake-places/fake-image-file';
import { fakePhotoImage } from '#libraries/fake-places/fake-photo-image';
import type { EntryGenerator, RequestHandler } from './$types';

const fileOf = fakeImageFile(fakePhotoImage, drawingOf);

export const prerender: boolean = true;

export const entries: EntryGenerator = () => FAKE_IMAGE_ENTRIES;

export const GET: RequestHandler = ({ params }) => fileOf(params.file);
