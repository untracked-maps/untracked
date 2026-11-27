import { type Drawing, photoFileOf } from './fake-photo-image';
import { PHOTO_FILES, type PhotoFamily } from './fake-photos';

type ImageParams = { readonly file: string };

type Draw = (drawing: Drawing, shade: number) => string;

const NOT_FOUND = 404;

const FAKE_IMAGE_ENTRIES: ImageParams[] = PHOTO_FILES.map((file) => ({ file }));

const fakeImageFile =
  (draw: Draw, drawingOf: (family: PhotoFamily) => Drawing) =>
  (file: string): Response => {
    const image = photoFileOf(file);
    return image === undefined
      ? new Response(undefined, { status: NOT_FOUND })
      : new Response(draw(drawingOf(image.family), image.shade), { headers: { 'content-type': 'image/svg+xml' } });
  };

export { FAKE_IMAGE_ENTRIES, fakeImageFile };
