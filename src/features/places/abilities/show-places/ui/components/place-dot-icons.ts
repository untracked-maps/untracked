import DRAWINGS from './place-dot-drawings.json' with { type: 'json' };
import { PLACE_DOT_ICON_PREFIX } from './place-dot-icon';

type PlaceDotIcon = {
  readonly id: string;
  readonly svg: string;
};

type Drawing = {
  readonly colour: string;
  readonly pictogram: string;
};

const white = '#FFFFFF';

const dotOf = ({ colour, pictogram }: Drawing): string =>
  [
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">',
    '<filter id="shadow" filterUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">',
    '<feDropShadow dx="0" dy="0.8" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.28"/>',
    '</filter>',
    `<circle cx="12" cy="12" r="10.4" fill="${white}" filter="url(#shadow)"/>`,
    `<circle cx="12" cy="12" r="9" fill="${colour}"/>`,
    `<path transform="translate(6.375 6.375) scale(0.46875)" fill="${white}" fill-rule="evenodd" d="${pictogram}"/>`,
    '</svg>'
  ].join('');

const placeDotIcons: readonly PlaceDotIcon[] = Object.entries(DRAWINGS).map(([family, drawing]) => ({
  id: `${PLACE_DOT_ICON_PREFIX}${family}`,
  svg: dotOf(drawing)
}));

export { placeDotIcons };
