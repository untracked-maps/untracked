import { BehaviorSubject, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { Coordinates, InspectedSpot } from '../../domain/inspect-point';
import SpotCard from './spot-card.svelte';

const LOUVRE: Coordinates = { longitude: 2.337_64, latitude: 48.860_61 };

const RIVOLI: InspectedSpot = { kind: 'address', spot: LOUVRE, address: 'Rue de Rivoli, 75001 Paris' };

const NOTE_AT_THE_LOUVRE = 'https://www.openstreetmap.org/note/new#map=19/48.86061/2.33764';

const MISSING_OR_WRONG = /^Is something missing or wrong\? Report it on OpenStreetMap ↗, the free map we use\./u;

const props = { spot: of(RIVOLI), onClose: (): void => undefined };

const recordingCloses = (): { readonly closes: string[]; readonly onClose: () => void } => {
  const closes: string[] = [];
  const onClose = (): void => {
    closes.push('closed');
  };
  return { closes, onClose };
};

const closesOnKey = async (key: string): Promise<readonly string[]> => {
  const { closes, onClose } = recordingCloses();
  await render(SpotCard, { ...props, onClose });
  page.getByRole('link', { name: 'Report', exact: true }).element().focus();
  await userEvent.keyboard(key);
  return closes;
};

describe('spot card, as shown', () => {
  it('is a region named by the street of the spot', async () => {
    await render(SpotCard, props);

    await expect.element(page.getByRole('region', { name: 'Rue de Rivoli' })).toBeVisible();
  });

  it('gives the rest of the address', async () => {
    await render(SpotCard, props);

    await expect.element(page.getByText('75001 Paris')).toBeVisible();
  });

  it('shows nothing while no spot is inspected', async () => {
    await render(SpotCard, { ...props, spot: of<InspectedSpot>({ kind: 'none' }) });

    await expect.element(page.getByRole('region')).not.toBeInTheDocument();
  });

  it('follows the spot inspected', async () => {
    const spot = new BehaviorSubject<InspectedSpot>(RIVOLI);
    await render(SpotCard, { ...props, spot });

    spot.next({ kind: 'no-address', spot: LOUVRE });

    await expect.element(page.getByRole('region', { name: 'No address here' })).toBeVisible();
  });

  it('announces the spot inspected', async () => {
    await render(SpotCard, props);

    await expect
      .element(page.getByRole('region').element().closest<HTMLElement>('.spot'))
      .toHaveAttribute('aria-live', 'polite');
  });
});

describe('spot card, to report a mistake', () => {
  it('reports a mistake with a note on OpenStreetMap at the spot', async () => {
    await render(SpotCard, props);

    await expect.element(page.getByRole('link', { name: 'Report', exact: true })).toHaveAttribute('href', NOTE_AT_THE_LOUVRE);
  });

  it('leaves the site to report a mistake', async () => {
    await render(SpotCard, props);

    await expect.element(page.getByRole('link', { name: 'Report', exact: true })).toHaveAttribute('rel', 'external');
  });

  it('asks the visitor to report what is missing or wrong', async () => {
    await render(SpotCard, props);

    await expect.element(page.getByText(MISSING_OR_WRONG)).toBeVisible();
  });

  it('links the request to a note on OpenStreetMap at the spot', async () => {
    await render(SpotCard, props);

    await expect
      .element(page.getByRole('link', { name: 'Report it on OpenStreetMap ↗' }))
      .toHaveAttribute('href', NOTE_AT_THE_LOUVRE);
  });

  it('leaves the site from the request too', async () => {
    await render(SpotCard, props);

    await expect.element(page.getByRole('link', { name: 'Report it on OpenStreetMap ↗' })).toHaveAttribute('rel', 'external');
  });
});

describe('spot card, once read', () => {
  it('closes with its close button', async () => {
    const { closes, onClose } = recordingCloses();
    await render(SpotCard, { ...props, onClose });

    await page.getByRole('button', { name: 'Close the card' }).click();

    expect(closes).toEqual(['closed']);
  });

  it('closes with Escape', async () => {
    expect(await closesOnKey('{Escape}')).toEqual(['closed']);
  });

  it('stays open with other keys', async () => {
    expect(await closesOnKey('{Shift}')).toEqual([]);
  });
});
