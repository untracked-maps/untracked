import { describe, expect, it } from 'vitest';
import { buildGlyphs } from './build-glyphs';

const loadNotFontData = async (): Promise<Buffer> => Buffer.from('not a font');

describe('build glyphs', () => {
  it('renders a range of a font stack as a non-empty protocol buffer', async () => {
    const glyphs = await buildGlyphs('Inter Regular', { start: 0, end: 255 });

    expect(glyphs.byteLength).toBeGreaterThan(0);
  });

  it('fails on data that is not a font', async () => {
    await expect(buildGlyphs('Inter Regular', { start: 0, end: 255 }, loadNotFontData)).rejects.toThrow('could not open font');
  });
});
