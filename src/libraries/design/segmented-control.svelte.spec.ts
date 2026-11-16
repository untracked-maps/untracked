import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import SegmentedControl from './segmented-control.svelte';

const options = [
  { value: 'walk', label: 'Walk' },
  { value: 'bike', label: 'Bike' }
] as const;

describe('segmented control', () => {
  it('groups its options under its legend', async () => {
    await render(SegmentedControl, { legend: 'Mode', name: 'mode', options, selected: 'walk', onSelect: () => undefined });

    await expect.element(page.getByRole('group', { name: 'Mode' })).toBeVisible();
  });

  it('checks the selected option', async () => {
    await render(SegmentedControl, { legend: 'Mode', name: 'mode', options, selected: 'bike', onSelect: () => undefined });

    await expect.element(page.getByRole('radio', { name: 'Bike' })).toBeChecked();
  });

  it('leaves the other options unchecked', async () => {
    await render(SegmentedControl, { legend: 'Mode', name: 'mode', options, selected: 'bike', onSelect: () => undefined });

    await expect.element(page.getByRole('radio', { name: 'Walk' })).not.toBeChecked();
  });

  it('tells which option the visitor selects', async () => {
    const selections: string[] = [];
    await render(SegmentedControl, {
      legend: 'Mode',
      name: 'mode',
      options,
      selected: 'walk',
      onSelect: (value: string): void => {
        selections.push(value);
      }
    });

    await page.getByRole('radio', { name: 'Bike' }).click();

    expect(selections).toEqual(['bike']);
  });

  it('puts every option in one radio group, so that the arrow keys move between them', async () => {
    await render(SegmentedControl, { legend: 'Mode', name: 'mode', options, selected: 'walk', onSelect: () => undefined });

    await expect.element(page.getByRole('radio', { name: 'Bike' })).toHaveAttribute('name', 'mode');
  });
});
