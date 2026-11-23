import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Icon from './share-icon.svelte';

describe('share icon', () => {
  it('is hidden from assistive technologies, the control around it carrying the name', async () => {
    const { container } = await render(Icon);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('is 17 px wide', async () => {
    const { container } = await render(Icon);

    expect(container.querySelector('svg')?.getBoundingClientRect().width).toBe(17);
  });
});
