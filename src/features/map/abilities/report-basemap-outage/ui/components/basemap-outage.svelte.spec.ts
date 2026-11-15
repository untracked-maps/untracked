import { BehaviorSubject, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import BasemapOutage from './basemap-outage.svelte';

const OUTAGE_MESSAGE = 'The map background is not responding at the moment: streets and names may be missing.';

describe('basemap outage', () => {
  it('tells the visitor that the basemap is not responding', async () => {
    await render(BasemapOutage, { outage: of(true) });

    await expect.element(page.getByRole('status')).toHaveTextContent(OUTAGE_MESSAGE);
  });

  it('says nothing while the basemap responds', async () => {
    await render(BasemapOutage, { outage: of(false) });

    await expect.element(page.getByText(OUTAGE_MESSAGE)).not.toBeInTheDocument();
  });

  it('keeps an empty live region in place, so that an outage is announced', async () => {
    await render(BasemapOutage, { outage: of(false) });

    await expect.element(page.getByRole('status')).toBeInTheDocument();
  });

  it('withdraws the message once the basemap responds again', async () => {
    const outage = new BehaviorSubject(true);
    await render(BasemapOutage, { outage });

    outage.next(false);

    await expect.element(page.getByText(OUTAGE_MESSAGE)).not.toBeInTheDocument();
  });
});
