import { firstValueFrom, lastValueFrom, toArray } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { clipboardCopy } from './clipboard';

type Written = { readonly texts: string[]; readonly writeText: (text: string) => Promise<void> };

const writing = (): Written => {
  const texts: string[] = [];
  return {
    texts,
    writeText: (text): Promise<void> => {
      texts.push(text);
      return Promise.resolve();
    }
  };
};

describe('copying with the clipboard', () => {
  it('writes the text in the clipboard', async () => {
    const clipboard = writing();

    await lastValueFrom(clipboardCopy(clipboard)('75006 Paris'));

    expect(clipboard.texts).toEqual(['75006 Paris']);
  });

  it('writes the text only once asked', () => {
    const clipboard = writing();

    clipboardCopy(clipboard)('75006 Paris');

    expect(clipboard.texts).toEqual([]);
  });

  it('completes once the text is written', async () => {
    expect(await lastValueFrom(clipboardCopy(writing())('75006 Paris').pipe(toArray()))).toEqual([undefined]);
  });

  it('fails when the clipboard refuses', async () => {
    await expect(
      firstValueFrom(clipboardCopy({ writeText: () => Promise.reject(new Error('Not allowed.')) })('75006 Paris'))
    ).rejects.toThrow('Not allowed.');
  });

  it('fails when the browser has no clipboard', async () => {
    await expect(firstValueFrom(clipboardCopy(undefined)('75006 Paris'))).rejects.toThrow('This browser offers no clipboard.');
  });
});
