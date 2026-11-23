import { describe, expect, it } from 'vitest';
import { fetchedOnce } from './fetched-once';

type Fetching = { readonly urls: string[]; readonly fetchFile: (url: string) => Promise<Response> };

const answering = (status: number): Fetching => {
  const urls: string[] = [];
  return {
    urls,
    fetchFile: (url): Promise<Response> => {
      urls.push(url);
      return Promise.resolve(new Response('[1, 2]', { status }));
    }
  };
};

describe('a file fetched once', () => {
  it('is fetched only once asked', () => {
    const fetching = answering(200);

    fetchedOnce(fetching.fetchFile, '/data/places.json');

    expect(fetching.urls).toEqual([]);
  });

  it('is fetched once, however often it is read', async () => {
    const fetching = answering(200);
    const read = fetchedOnce(fetching.fetchFile, '/data/places.json');

    await read();
    await read();

    expect(fetching.urls).toEqual(['/data/places.json']);
  });

  it('gives its content at each read', async () => {
    const read = fetchedOnce(answering(200).fetchFile, '/data/places.json');
    await (await read()).json();

    expect(await (await read()).json()).toEqual([1, 2]);
  });

  it('fails when the file does not answer 200', async () => {
    const read = fetchedOnce(answering(500).fetchFile, '/data/places.json');

    await expect(read()).rejects.toThrow('The file answered 500.');
  });
});
