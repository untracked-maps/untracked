import {
  ColorSpace,
  contrastWCAG21,
  getColor,
  getLuminance,
  mix,
  type PlainColorObject,
  serialize,
  sRGB,
  tryColor
} from 'colorjs.io/fn';

type Colours = {
  readonly colour: string;
  readonly textColour: string;
};

type Wanted = {
  readonly colour?: string | undefined;
  readonly textColour?: string | undefined;
};

ColorSpace.register(sRGB);

const HUNDREDTHS = 100;

const READABLE_IN_HUNDREDTHS = 450;

const MOST_KEPT = 0.95;

const LESS_KEPT_EACH_STEP = 0.05;

const SHADES = 15;

const KEPT: readonly number[] = Array.from({ length: SHADES }, (_, step) => MOST_KEPT - step * LESS_KEPT_EACH_STEP);

const LEAST_KEPT = MOST_KEPT - (SHADES - 1) * LESS_KEPT_EACH_STEP;

const colourOf = (text: string | undefined, fallback: string): PlainColorObject =>
  tryColor(text ?? fallback) ?? getColor(fallback);

const hexOf = (colour: PlainColorObject): string => serialize(colour, { format: 'hex', collapse: false });

const shaded =
  (colour: PlainColorObject, toward: string) =>
  (keep: number): PlainColorObject =>
    mix(colour, toward, 1 - keep);

const readableColours = ({ colour, textColour }: Wanted): Colours => {
  const background = colourOf(colour, '#5B6573');
  const text = colourOf(textColour, '#FFFFFF');
  const readable = (candidate: PlainColorObject): boolean =>
    Math.floor(contrastWCAG21(candidate, text) * HUNDREDTHS) >= READABLE_IN_HUNDREDTHS;
  const toward = getLuminance(text) > getLuminance(background) ? '#000000' : '#FFFFFF';
  const shade = shaded(background, toward);
  const chosen = [background, ...KEPT.map(shade)].find(readable) ?? shade(LEAST_KEPT);
  return { colour: hexOf(chosen), textColour: hexOf(text) };
};

export { type Colours, readableColours };
