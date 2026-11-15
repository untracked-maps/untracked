import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import fontnik from 'fontnik';
import decompress from 'woff2-encoder/decompress';
import type { FontStack } from './font-stacks';
import type { GlyphRange } from './glyph-ranges';

const INTER_FILES: Readonly<Record<FontStack, string>> = {
  'Inter Regular': 'Inter-Regular.woff2',
  'Inter Medium': 'Inter-Medium.woff2',
  'Inter SemiBold': 'Inter-SemiBold.woff2',
  'Inter Bold': 'Inter-Bold.woff2',
  'Inter Italic': 'Inter-Italic.woff2'
};

const { resolve } = createRequire(import.meta.url);

const fontOf = async (stack: FontStack): Promise<Buffer> =>
  Buffer.from(await decompress(await readFile(resolve(`inter-ui/web/${INTER_FILES[stack]}`))));

const rangeOf = (font: Buffer, { start, end }: GlyphRange): Promise<Buffer> =>
  new Promise((resolveRange, rejectRange) => {
    fontnik.range({ font, start, end }, (error, data) => (error === null ? resolveRange(data) : rejectRange(error)));
  });

type FontLoader = (stack: FontStack) => Promise<Buffer>;

const buildGlyphs = async (stack: FontStack, range: GlyphRange, loadFont: FontLoader = fontOf): Promise<Buffer> =>
  rangeOf(await loadFont(stack), range);

export { buildGlyphs };
