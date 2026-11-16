import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import TransitLinesCredit from './transit-lines-credit.svelte';

describe('transit lines credit', () => {
  it('credits Île-de-France Mobilités while the transit lines are shown', async () => {
    await render(TransitLinesCredit, { shown: of(true) });

    await expect
      .element(page.getByRole('link', { name: '© Île-de-France Mobilités' }))
      .toHaveAttribute('href', 'https://data.iledefrance-mobilites.fr');
  });

  it('credits nobody more while the transit lines are hidden', async () => {
    await render(TransitLinesCredit, { shown: of(false) });

    await expect.element(page.getByRole('link')).not.toBeInTheDocument();
  });
});
