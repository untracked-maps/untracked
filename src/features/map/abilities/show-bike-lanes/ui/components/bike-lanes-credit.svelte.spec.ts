import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import BikeLanesCredit from './bike-lanes-credit.svelte';

describe('bike lanes credit', () => {
  it('credits IGN, which serves the bike lanes, while they are shown', async () => {
    await render(BikeLanesCredit, { shown: of(true) });

    await expect.element(page.getByRole('link', { name: 'Bike lanes: IGN' })).toBeVisible();
  });

  it('credits nobody more while the bike lanes are hidden', async () => {
    await render(BikeLanesCredit, { shown: of(false) });

    await expect.element(page.getByRole('link')).not.toBeInTheDocument();
  });
});
