import type { FakePicture } from './fake-street-views';

type PictureItem = {
  readonly type: 'Feature';
  readonly id: string;
  readonly geometry: { readonly type: 'Point'; readonly coordinates: readonly [number, number] };
  readonly properties: { readonly 'view:azimuth': number };
  readonly assets: { readonly hd: { readonly href: string; readonly type: 'image/svg+xml' } };
};

const pictureItem = ({ id, image, camera, azimuth }: FakePicture): PictureItem => ({
  type: 'Feature',
  id,
  geometry: { type: 'Point', coordinates: [camera.longitude, camera.latitude] },
  properties: { 'view:azimuth': azimuth },
  assets: { hd: { href: image, type: 'image/svg+xml' } }
});

export { pictureItem };
