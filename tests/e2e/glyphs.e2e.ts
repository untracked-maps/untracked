import { expect, test } from '@playwright/test';

test('serves the glyphs of a font stack the map uses', async ({ request }) => {
  const response = await request.get('glyphs/Inter%20Regular/0-255.pbf');

  expect(response.status()).toBe(200);
});
