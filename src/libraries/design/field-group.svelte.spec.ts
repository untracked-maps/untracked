import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import FieldGroup from './field-group.svelte';

const children = createRawSnippet(() => ({ render: (): string => '<input type="checkbox" aria-label="Transit lines" />' }));

describe('field group', () => {
  it('groups its fields under its legend', async () => {
    await render(FieldGroup, { legend: 'Layers', children });

    await expect.element(page.getByRole('group', { name: 'Layers' })).toBeVisible();
  });

  it('holds its fields', async () => {
    await render(FieldGroup, { legend: 'Layers', children });

    await expect.element(page.getByRole('group').getByRole('checkbox', { name: 'Transit lines' })).toBeVisible();
  });
});
