import { describe, expect, it } from 'vitest';
import { buildGlyphs } from './build-glyphs';
import { FONT_STACKS } from './font-stacks';

const loadNotFontData = async (): Promise<Buffer> => Buffer.from('not a font');

describe('build glyphs', () => {
  it('renders a range of a font stack as a non-empty protocol buffer', async () => {
    const glyphs = await buildGlyphs('Inter Regular', { start: 0, end: 255 });

    expect(glyphs.byteLength).toBeGreaterThan(0);
  });

  it.each(FONT_STACKS)('renders the glyphs of %s from its own font', async (stack) => {
    const glyphs = await buildGlyphs(stack, { start: 0, end: 255 });

    expect(glyphs.toString('latin1')).toContain(stack);
  });

  it('fails on data that is not a font', async () => {
    await expect(buildGlyphs('Inter Regular', { start: 0, end: 255 }, loadNotFontData)).rejects.toThrow('could not open font');
  });
});
