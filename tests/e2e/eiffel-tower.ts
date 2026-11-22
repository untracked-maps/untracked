import type { Page } from '@playwright/test';

type Colour = readonly [red: number, green: number, blue: number];

const WEST_OF_THE_EIFFEL_TOWER = '#map=16.5/48.85826/2.2922';

const EIFFEL_TOWER_FROM_THE_CENTRE = 300;

const INSIDE_THE_DISC = 7;

const COLOUR_OF_SIGHTS: Colour = [0x12, 0x91, 0x9e];

const WHITE: Colour = [255, 255, 255];

const MOST_DIFFERENCE = 12;

const colourIn = (page: Page, png: string): Promise<Colour> =>
  page.evaluate(async (encoded): Promise<Colour> => {
    const image = await createImageBitmap(new Blob([Uint8Array.from(atob(encoded), (byte) => byte.charCodeAt(0))]));
    const context = new OffscreenCanvas(1, 1).getContext('2d');
    context?.drawImage(image, 0, 0);
    const [red = 0, green = 0, blue = 0] = context?.getImageData(0, 0, 1, 1).data ?? [];
    return [red, green, blue];
  }, png);

const differenceFrom = (wanted: Colour, [red, green, blue]: Colour): number =>
  Math.max(Math.abs(red - wanted[0]), Math.abs(green - wanted[1]), Math.abs(blue - wanted[2]));

const differenceOnTheEiffelTower = async (page: Page, wanted: Colour, left = 0, above = 0): Promise<number> => {
  const { width, height } = page.viewportSize() ?? { width: 0, height: 0 };
  const pixel = await page.screenshot({
    clip: { x: width / 2 + EIFFEL_TOWER_FROM_THE_CENTRE - left, y: height / 2 - above, width: 1, height: 1 }
  });
  return differenceFrom(wanted, await colourIn(page, pixel.toString('base64')));
};

const eiffelTowerDrawn = async (page: Page, above: number): Promise<boolean> =>
  (await differenceOnTheEiffelTower(page, COLOUR_OF_SIGHTS, INSIDE_THE_DISC, above)) < MOST_DIFFERENCE;

export {
  COLOUR_OF_SIGHTS,
  differenceOnTheEiffelTower,
  EIFFEL_TOWER_FROM_THE_CENTRE,
  eiffelTowerDrawn,
  INSIDE_THE_DISC,
  MOST_DIFFERENCE,
  WEST_OF_THE_EIFFEL_TOWER,
  WHITE
};
