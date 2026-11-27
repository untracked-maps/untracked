import { defer, type Observable } from 'rxjs';
import type { LoadPicture, Picture } from '../../domain/show-street-view';

type Fields = Readonly<Record<string, unknown>>;

type FetchFile = (url: string) => Promise<Response>;

const isFields = (value: unknown): value is Fields => typeof value === 'object' && value !== null;

const fieldsOf = (value: unknown, key: string): Fields => {
  const field = isFields(value) ? value[key] : undefined;
  return isFields(field) ? field : {};
};

const isNumber = (value: unknown): value is number => Number.isFinite(value);

const pictureIn = (item: unknown): Picture => {
  const position = fieldsOf(item, 'geometry')['coordinates'];
  const azimuth = fieldsOf(item, 'properties')['view:azimuth'];
  const image = fieldsOf(fieldsOf(item, 'assets'), 'hd')['href'];
  if (!(Array.isArray(position) && isNumber(position[0]) && isNumber(position[1]) && isNumber(azimuth))) {
    throw new Error('The picture file gives no camera position or heading.');
  }
  if (typeof image !== 'string') {
    throw new Error('The picture file gives no image.');
  }
  return { image, camera: { longitude: position[0], latitude: position[1] }, azimuth };
};

const pictureFile = async (fetchFile: FetchFile, url: string): Promise<Picture> => {
  const response = await fetchFile(url);
  if (!response.ok) {
    throw new Error(`The picture file answered ${response.status}.`);
  }
  return pictureIn(await response.json());
};

const prerenderedPicture =
  (fetchFile: FetchFile, urlOf: (id: string) => string): LoadPicture =>
  (id: string): Observable<Picture> =>
    defer(() => pictureFile(fetchFile, urlOf(id)));

export { prerenderedPicture };
