import type { Page, Route } from '@playwright/test';

const OPENFREEMAP = 'https://tiles.openfreemap.org/**';

const refuse = (route: Route): Promise<void> => route.abort();

const refuseOpenFreeMap = async ({ page }: { readonly page: Page }): Promise<void> => {
  await page.route(OPENFREEMAP, refuse);
};

export { refuseOpenFreeMap };
