import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { lazyCategoryWords } from './lazy-category-words';

describe('category words loaded on demand', () => {
  it('find the category a query names', async () => {
    const findCategory = await firstValueFrom(lazyCategoryWords());

    expect(findCategory('boulangeries')).toBe('bakeries');
  });
});
