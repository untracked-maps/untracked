import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import PictureChoice from './picture-choice.svelte';

const choices = [
  { value: 'plan', label: 'Plan' },
  { value: 'satellite', label: 'Satellite' }
] as const;

const picture = createRawSnippet((value: () => string) => ({
  render: (): string => `<img alt="" data-picture="${value()}" src="data:," />`
}));

const props = { legend: 'Map type', name: 'basemap', choices, chosen: 'plan', onChoose: (): void => undefined, picture };

describe('picture choice', () => {
  it('groups its choices under its legend', async () => {
    await render(PictureChoice, props);

    await expect.element(page.getByRole('group', { name: 'Map type' })).toBeVisible();
  });

  it('checks the chosen value', async () => {
    await render(PictureChoice, { ...props, chosen: 'satellite' });

    await expect.element(page.getByRole('radio', { name: 'Satellite' })).toBeChecked();
  });

  it('leaves the other choices unchecked', async () => {
    await render(PictureChoice, { ...props, chosen: 'satellite' });

    await expect.element(page.getByRole('radio', { name: 'Plan' })).not.toBeChecked();
  });

  it('draws the picture of each choice', async () => {
    await render(PictureChoice, props);

    expect(document.querySelector('[data-picture="satellite"]')).not.toBeNull();
  });

  it('tells which value the visitor chooses', async () => {
    const chosen: string[] = [];
    await render(PictureChoice, {
      ...props,
      onChoose: (value: string): void => {
        chosen.push(value);
      }
    });

    await page.getByRole('radio', { name: 'Satellite' }).click();

    expect(chosen).toEqual(['satellite']);
  });

  it('puts every choice in one radio group, so that the arrow keys move between them', async () => {
    await render(PictureChoice, props);

    await expect.element(page.getByRole('radio', { name: 'Satellite' })).toHaveAttribute('name', 'basemap');
  });
});
