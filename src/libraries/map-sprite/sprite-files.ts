import { type SpriteSheetResult, Sprites } from '@basemaps/sprites';

type Sprite = {
  readonly name: string;
  readonly icons: readonly { readonly id: string; readonly svg: string }[];
};

type SpriteFile = {
  readonly name: string;
  readonly type: string;
  readonly body: Uint8Array<ArrayBuffer>;
};

const PIXEL_RATIOS: readonly number[] = [1, 2];

const sheetName = (name: string, pixelRatio: number): string => (pixelRatio === 1 ? name : `${name}@${pixelRatio}x`);

const filesOfSheet =
  (name: string) =>
  ({ pixelRatio, layout, buffer }: SpriteSheetResult): SpriteFile[] => [
    {
      name: `${sheetName(name, pixelRatio)}.json`,
      type: 'application/json',
      body: new TextEncoder().encode(JSON.stringify(layout))
    },
    { name: `${sheetName(name, pixelRatio)}.png`, type: 'image/png', body: new Uint8Array(buffer) }
  ];

const spriteFileNames = ({ name }: Sprite): string[] =>
  PIXEL_RATIOS.flatMap((pixelRatio) => [`${sheetName(name, pixelRatio)}.json`, `${sheetName(name, pixelRatio)}.png`]);

const spriteFiles = async ({ name, icons }: Sprite): Promise<SpriteFile[]> =>
  (
    await Sprites.generate(
      icons.map(({ id, svg }) => ({ id, buffer: Buffer.from(svg) })),
      PIXEL_RATIOS
    )
  ).flatMap(filesOfSheet(name));

const spriteFile = async (sprite: Sprite, name: string): Promise<SpriteFile | undefined> =>
  (await spriteFiles(sprite)).find((file) => file.name === name);

export { spriteFile, spriteFileNames };
