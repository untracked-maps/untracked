import type { Page, Route } from '@playwright/test';

const GEOPLATEFORME = 'https://data.geopf.fr/**';

const ILE_DE_FRANCE_MOBILITES = 'https://data.iledefrance-mobilites.fr/**';

const METRO_1 = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [2.3376, 48.8606],
          [2.347, 48.8586]
        ]
      },
      properties: { mode: 'METRO', ['colourweb_hexa']: 'ffcd00' }
    }
  ]
};

const answerWithMetro1 = (route: Route): Promise<void> => route.fulfill({ json: METRO_1 });

const answerWithNothing = (route: Route): Promise<void> => route.fulfill({ status: 204 });

const fakeOpenData = async ({ page }: { readonly page: Page }): Promise<void> => {
  await page.route(GEOPLATEFORME, answerWithNothing);
  await page.route(ILE_DE_FRANCE_MOBILITES, answerWithMetro1);
};

const isOpenData = (url: string): boolean =>
  url.startsWith('https://data.geopf.fr/') || url.startsWith('https://data.iledefrance-mobilites.fr/');

export { fakeOpenData, isOpenData };
