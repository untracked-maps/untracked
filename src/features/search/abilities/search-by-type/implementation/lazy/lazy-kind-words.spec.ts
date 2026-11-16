import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { lazyKindWords } from './lazy-kind-words';

describe('kind words loaded on demand', () => {
  it('find the kind a query names', async () => {
    const findKind = await firstValueFrom(lazyKindWords());

    expect(findKind('boulangeries')).toBe('bakery');
  });
});
