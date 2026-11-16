import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import Suggestion from './suggestion.svelte';

const icon = createRawSnippet(() => ({ render: (): string => '<svg data-testid="icon"></svg>' }));

const LOUVRE = { icon, name: 'Musée du Louvre', details: 'Museum · Rue de Rivoli' };

const SUNKEN = 'rgb(243, 243, 245)';

describe('suggestion', () => {
  it('shows the name', async () => {
    await render(Suggestion, LOUVRE);

    await expect.element(page.getByText('Musée du Louvre')).toBeVisible();
  });

  it('shows the details', async () => {
    await render(Suggestion, LOUVRE);

    await expect.element(page.getByText('Museum · Rue de Rivoli')).toBeVisible();
  });

  it('shows its icon', async () => {
    await render(Suggestion, LOUVRE);

    await expect.element(page.getByTestId('icon')).toBeInTheDocument();
  });

  it('stands out when active', async () => {
    const { container } = await render(Suggestion, { ...LOUVRE, active: true });

    expect(container.querySelector('.suggestion')).toHaveStyle({ backgroundColor: SUNKEN });
  });

  it('blends in the panel otherwise', async () => {
    const { container } = await render(Suggestion, LOUVRE);

    expect(container.querySelector('.suggestion')).not.toHaveStyle({ backgroundColor: SUNKEN });
  });
});
