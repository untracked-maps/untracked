import { type Drawing, shaded } from './fake-photo-image';

const WIDTH = 2000;

const HEIGHT = 1000;

const GRID = 32;

const BUILDING_WIDTH = 250;

const BUILDINGS = WIDTH / BUILDING_WIDTH + 1;

const FIRST_LEFT = -BUILDING_WIDTH / 2;

const FRONT_LEFT = (WIDTH - BUILDING_WIDTH) / 2;

const LOWEST_ROOF = 340;

const ROOF_STEPS = 160;

const ROOF_STRIDE = 37;

const SHADE_STRIDE = 53;

const STREET_LEVEL = 640;

const ROAD_LEVEL = 800;

const FRONT_MARGIN = 14;

const FRONT_TOP = 410;

const PICTOGRAM_SIZE = 140;

const STONES = ['#d9cbb5', '#cbbba3', '#e3d7c3', '#bfae94'];

const roofOf = (index: number, shade: number): number =>
  LOWEST_ROOF - ((index * ROOF_STRIDE + shade * SHADE_STRIDE) % ROOF_STEPS);

const buildingOf =
  (shade: number) =>
  (index: number): string =>
    `<rect x="${FIRST_LEFT + index * BUILDING_WIDTH}" y="${roofOf(index, shade)}" width="${BUILDING_WIDTH}" height="${STREET_LEVEL - roofOf(index, shade)}" fill="${STONES[index % STONES.length]}"/>`;

const frontOf = ({ colour, pictogram }: Drawing, shade: number): readonly string[] => {
  const left = FRONT_LEFT + FRONT_MARGIN;
  const width = BUILDING_WIDTH - 2 * FRONT_MARGIN;
  const height = STREET_LEVEL - FRONT_TOP;
  const scale = PICTOGRAM_SIZE / GRID;
  return [
    `<rect x="${left}" y="${FRONT_TOP}" width="${width}" height="${height}" fill="${shaded(colour, shade)}"/>`,
    `<path d="${pictogram}" fill="#ffffff" fill-opacity="0.92" transform="translate(${left + (width - PICTOGRAM_SIZE) / 2} ${FRONT_TOP + (height - PICTOGRAM_SIZE) / 2}) scale(${scale})"/>`
  ];
};

const fakeStreetViewImage = (drawing: Drawing, shade: number): string =>
  [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">`,
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="#cfe3f2"/>`,
    ...Array.from({ length: BUILDINGS }, (_, index) => buildingOf(shade)(index)),
    ...frontOf(drawing, shade),
    `<rect y="${STREET_LEVEL}" width="${WIDTH}" height="${HEIGHT - STREET_LEVEL}" fill="#a9a9a9"/>`,
    `<rect y="${ROAD_LEVEL}" width="${WIDTH}" height="${HEIGHT - ROAD_LEVEL}" fill="#6b6b6b"/>`,
    '</svg>'
  ].join('');

export { fakeStreetViewImage };
