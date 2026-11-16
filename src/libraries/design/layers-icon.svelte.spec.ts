import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Icon from './layers-icon.svelte';

describe('layers icon', () => {
  it('is hidden from assistive technologies, the control around it carrying the name', async () => {
    const { container } = await render(Icon);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
