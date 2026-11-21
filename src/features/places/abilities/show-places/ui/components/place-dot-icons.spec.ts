import { describe, expect, it } from 'vitest';
import { spriteFile } from '#libraries/map-sprite/sprite-files';
import { placeDotIcons } from './place-dot-icons';

const WHITE = '#FFFFFF';

const ORANGE = '#E8742F';

const BLUE = '#4169D8';

const FOOD_DOT = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">',
  '<filter id="shadow" filterUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">',
  '<feDropShadow dx="0" dy="0.8" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.28"/>',
  '</filter>',
  `<circle cx="12" cy="12" r="10.4" fill="${WHITE}" filter="url(#shadow)"/>`,
  `<circle cx="12" cy="12" r="9" fill="${ORANGE}"/>`,
  '<path transform="translate(6.375 6.375) scale(0.46875)" fill="#FFFFFF" fill-rule="evenodd" d="',
  'M7 3v7.5a2 2 0 0 0 1.5 1.9V21h1.6v-8.6a2 2 0 0 0 1.5-1.9V3h-1.3v6H9.6V3H8.4v6H7.7V3z',
  'M15.5 3c-1.6 0-2.6 2.6-2.6 5.6v4.2h2V21h1.6V3z',
  '"/>',
  '</svg>'
].join('');

const indexOfSprite = async (): Promise<unknown> =>
  JSON.parse(new TextDecoder().decode((await spriteFile({ name: 'places', icons: placeDotIcons }, 'places.json'))?.body));

describe('place dot icons', () => {
  it('are one per family, and one for the places without a family', () => {
    expect(placeDotIcons.map(({ id }) => id)).toStrictEqual([
      'place-food',
      'place-cafe',
      'place-bar',
      'place-bakery',
      'place-shop',
      'place-culture',
      'place-sight',
      'place-nature',
      'place-health',
      'place-stay',
      'place-money',
      'place-fuel',
      'place-train',
      'place-none'
    ]);
  });

  it('draw a white pictogram on a disc of the colour of the family, ringed in white over a shadow', () => {
    expect(placeDotIcons[0]?.svg).toBe(FOOD_DOT);
  });

  it('draw each family in its own colour', () => {
    expect(placeDotIcons[4]?.svg).toContain(`<circle cx="12" cy="12" r="9" fill="${BLUE}"/>`);
  });

  it('are images of 24 pixels that the sprite of the map can hold', async () => {
    expect(await indexOfSprite()).toMatchObject({ 'place-none': { width: 24, height: 24, pixelRatio: 1 } });
  });
});
