import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { locationFragment, replacedFragment } from './url-fragment';

describe('location fragment', () => {
  it('is the hash of the location, without its sign', async () => {
    expect(await firstValueFrom(locationFragment({ hash: '#map=13/48.8566/2.3522' })())).toBe('map=13/48.8566/2.3522');
  });

  it('is empty when the location has no hash', async () => {
    expect(await firstValueFrom(locationFragment({ hash: '' })())).toBe('');
  });
});

describe('replaced fragment', () => {
  it('gives the fragment back once the URL is replaced', async () => {
    expect(await firstValueFrom(replacedFragment(() => Promise.resolve())('map=13/48.8566/2.3522'))).toBe(
      'map=13/48.8566/2.3522'
    );
  });

  it('replaces the URL with the fragment as its hash', async () => {
    const urls: string[] = [];

    await firstValueFrom(
      replacedFragment((url) => {
        urls.push(url);
        return Promise.resolve();
      })('map=13/48.8566/2.3522')
    );

    expect(urls).toEqual(['#map=13/48.8566/2.3522']);
  });
});
