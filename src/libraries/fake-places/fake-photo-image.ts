import { PHOTO_FAMILIES, PHOTO_FILES, type PhotoFamily, SHADES } from './fake-photos';

type Drawing = {
  readonly colour: string;
  readonly pictogram: string;
};

type PhotoFile = {
  readonly family: PhotoFamily;
  readonly shade: number;
};

const WIDTH = 800;

const HEIGHT = 600;

const GRID = 32;

const PICTOGRAM_SIZE = 240;

const STRONGEST_MIX = 0.3;

const HEX = 16;

const RED_AT = 1;

const GREEN_AT = 3;

const BLUE_AT = 5;

const CHANNEL_STARTS = [RED_AT, GREEN_AT, BLUE_AT];

const CHANNEL = 255;

const FILE_NAME = /(?<family>[a-z]+)-(?<shade>\d{2})\.svg/u;

const KNOWN_FILES: ReadonlySet<string> = new Set(PHOTO_FILES);

const familyNamed = (name: string | undefined): PhotoFamily | undefined => PHOTO_FAMILIES.find((family) => family === name);

const photoFileOf = (file: string): PhotoFile | undefined => {
  const groups = KNOWN_FILES.has(file) ? FILE_NAME.exec(file)?.groups : undefined;
  const family = familyNamed(groups?.['family']);
  return family === undefined ? undefined : { family, shade: Number(groups?.['shade']) };
};

const mixOf = (shade: number): number => STRONGEST_MIX * ((2 * (shade - 1)) / (SHADES - 1) - 1);

const channelMixed = (channel: number, mix: number): number =>
  Math.round((channel + (CHANNEL - channel) * Math.max(mix, 0)) * (1 + Math.min(mix, 0)));

const shaded = (colour: string, shade: number): string => {
  const mix = mixOf(shade);
  const channels = CHANNEL_STARTS.map((start) => channelMixed(Number.parseInt(colour.slice(start, start + 2), HEX), mix));
  return `#${channels.map((channel) => channel.toString(HEX).padStart(2, '0')).join('')}`;
};

const fakePhotoImage = ({ colour, pictogram }: Drawing, shade: number): string => {
  const scale = PICTOGRAM_SIZE / GRID;
  const left = (WIDTH - PICTOGRAM_SIZE) / 2;
  const top = (HEIGHT - PICTOGRAM_SIZE) / 2;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">`,
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="${shaded(colour, shade)}"/>`,
    `<path d="${pictogram}" fill="#ffffff" fill-opacity="0.92" transform="translate(${left} ${top}) scale(${scale})"/>`,
    '</svg>'
  ].join('');
};

export { type Drawing, fakePhotoImage, photoFileOf, shaded };
