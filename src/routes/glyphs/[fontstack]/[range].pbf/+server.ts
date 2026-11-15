import { error } from '@sveltejs/kit';
import { buildGlyphs } from '#libraries/map-glyphs/build-glyphs';
import { FONT_STACKS, isFontStack } from '#libraries/map-glyphs/font-stacks';
import { glyphRanges, parseRangeName, rangeName } from '#libraries/map-glyphs/glyph-ranges';
import type { EntryGenerator, RequestHandler } from './$types';

const NOT_FOUND = 404;

export const prerender: boolean = true;

export const entries: EntryGenerator = () =>
  FONT_STACKS.flatMap((fontstack) => glyphRanges().map((range) => ({ fontstack, range: rangeName(range) })));

export const GET: RequestHandler = async ({ params }) => {
  const range = parseRangeName(params.range);
  if (!(isFontStack(params.fontstack) && range)) {
    error(NOT_FOUND);
  }
  return new Response(new Uint8Array(await buildGlyphs(params.fontstack, range)), {
    headers: { 'content-type': 'application/x-protobuf' }
  });
};
