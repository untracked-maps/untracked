import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { inMemoryLocate } from './in-memory-locate';

describe('in-memory locate', () => {
  it('answers with the position it holds', async () => {
    const position = { kind: 'located', position: { longitude: 2.3445, latitude: 48.8587 } } as const;

    expect(await firstValueFrom(inMemoryLocate(position)())).toEqual(position);
  });

  it('answers with the failure it holds', async () => {
    expect(await firstValueFrom(inMemoryLocate({ kind: 'permission-denied' })())).toEqual({ kind: 'permission-denied' });
  });
});
