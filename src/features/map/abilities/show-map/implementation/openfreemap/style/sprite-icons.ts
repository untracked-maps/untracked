import { basemapSpriteName, metroIcon } from './sprite';

type BasemapSprite = {
  readonly name: string;
  readonly icons: readonly { readonly id: string; readonly svg: string }[];
};

const metroBlue = '#2B4793';

const white = '#FFFFFF';

const metroLetter = ['M7 15V7h2.2L11 10.6', 'L12.8 7H15v8h-1.9V10.2', 'L11.6 13.2h-1.2', 'L8.9 10.2V15z'].join(' ');

const basemapSprite: BasemapSprite = {
  name: basemapSpriteName,
  icons: [
    {
      id: metroIcon,
      svg: [
        '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">',
        `<circle cx="11" cy="11" r="10.4" fill="${white}"/>`,
        `<circle cx="11" cy="11" r="9" fill="${metroBlue}"/>`,
        `<path d="${metroLetter}" fill="${white}"/>`,
        '</svg>'
      ].join('')
    }
  ]
};

export { basemapSprite };
