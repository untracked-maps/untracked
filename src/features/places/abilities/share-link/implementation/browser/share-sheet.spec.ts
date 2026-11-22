import { EMPTY, firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import type { SharedLink } from '../../domain/share-link';
import { shareSheet } from './share-sheet';

const FLORE: SharedLink = { title: 'Café de Flore', url: 'https://example.org/#map=17/48.85/2.33&place=flore' };

type Device = { readonly given: ShareData[]; readonly share: (data: ShareData) => Promise<void> };

const answering = (answer: () => Promise<void>): Device => {
  const given: ShareData[] = [];
  return {
    given,
    share(this: Device, data: ShareData): Promise<void> {
      this.given.push(data);
      return answer();
    }
  };
};

describe('share sheet of the device', () => {
  it('is missing when the device has none', () => {
    expect(shareSheet({})).toBeUndefined();
  });

  it('is missing without a device', () => {
    expect(shareSheet(undefined)).toBeUndefined();
  });

  it('gives the device the title and the link alone', async () => {
    const device = answering(() => Promise.resolve());

    await firstValueFrom(shareSheet(device)?.(FLORE) ?? EMPTY);

    expect(device.given).toEqual([{ title: 'Café de Flore', url: FLORE.url }]);
  });

  it('opens only once asked', () => {
    const device = answering(() => Promise.resolve());

    shareSheet(device)?.(FLORE);

    expect(device.given).toEqual([]);
  });

  it('tells the link is shared', async () => {
    expect(await firstValueFrom(shareSheet(answering(() => Promise.resolve()))?.(FLORE) ?? EMPTY)).toBe('shared');
  });

  it('tells the share is cancelled when the visitor closes it', async () => {
    const device = answering(() => Promise.reject(new DOMException('Share canceled.', 'AbortError')));

    expect(await firstValueFrom(shareSheet(device)?.(FLORE) ?? EMPTY)).toBe('cancelled');
  });

  it('fails when the device refuses', async () => {
    const refusal = new DOMException('Not allowed.', 'NotAllowedError');
    const device = answering(() => Promise.reject(refusal));

    await expect(firstValueFrom(shareSheet(device)?.(FLORE) ?? EMPTY)).rejects.toBe(refusal);
  });
});
