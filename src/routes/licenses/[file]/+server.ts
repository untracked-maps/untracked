import { error } from '@sveltejs/kit';
import { LICENSE_FILES, licenseText } from '#libraries/license-texts/license-texts';
import type { EntryGenerator, RequestHandler } from './$types';

const NOT_FOUND = 404;

export const prerender: boolean = true;

export const entries: EntryGenerator = () => LICENSE_FILES.map((file) => ({ file }));

export const GET: RequestHandler = async ({ params }) => {
  const text = await licenseText(params.file);
  if (text === undefined) {
    error(NOT_FOUND);
  }
  return new Response(text, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
