import { type Observable, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { type Locator, page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { CategoryKey } from '../../domain/categories';
import KindNamed from './kind-named.svelte';

const shown = async (named: Observable<CategoryKey | undefined>): Promise<readonly string[]> => {
  const seen: string[] = [];
  await render(KindNamed, {
    named,
    onChoose: (category: CategoryKey): void => {
      seen.push(category);
    },
    onClear: (): void => {
      seen.push('cleared');
    }
  });
  return seen;
};

const BAKERIES_NEAR_YOU = /^Bakeries near you/u;

const row = (): Locator => page.getByRole('button', { name: BAKERIES_NEAR_YOU });

describe('kind named in the search field', () => {
  it('offers the places of the kind near the visitor', async () => {
    await shown(of('bakeries'));

    await expect.element(row()).toBeVisible();
  });

  it('says they are around the centre of the map', async () => {
    await shown(of('bakeries'));

    await expect.element(row()).toHaveAccessibleName('Bakeries near you Around the centre of the map');
  });

  it('offers nothing while no kind is named', async () => {
    await shown(of(undefined));

    await expect.element(page.getByRole('button')).not.toBeInTheDocument();
  });

  it('clears the field, then chooses the kind', async () => {
    const seen = await shown(of('bakeries'));

    await row().click();

    expect(seen).toEqual(['cleared', 'bakeries']);
  });
});
