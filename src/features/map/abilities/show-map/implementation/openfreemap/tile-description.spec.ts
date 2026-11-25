import { describe, expect, it } from 'vitest';
import { openFreeMapProtocol } from './tile-description';

type FetchFile = Parameters<typeof openFreeMapProtocol>[0];

const PLANET = 'https://tiles.openfreemap.org/planet';

const BACKUP = 'https://tiles.openfreemap.org/backup_planet';

const answering =
  (answers: Readonly<Record<string, Response>>): FetchFile =>
  (url): Promise<Response> =>
    answers[url] === undefined ? Promise.reject(new TypeError('Failed to fetch')) : Promise.resolve(answers[url]);

const description = (tiles: string): Response => Response.json({ tilejson: '3.0.0', tiles: [tiles] });

const descriptionFrom = (fetchFile: FetchFile): Promise<unknown> =>
  openFreeMapProtocol(fetchFile).load('openfreemap://planet', new AbortController());

describe('the description of the OpenFreeMap tiles', () => {
  it('is read through the protocol of the OpenFreeMap tiles', () => {
    expect(openFreeMapProtocol(answering({})).name).toBe('openfreemap');
  });

  it('comes from the planet when the planet answers, even if the backup answers too', async () => {
    const fetchFile = answering({ [PLANET]: description('planet/{z}/{x}/{y}'), [BACKUP]: description('backup/{z}/{x}/{y}') });

    await expect(descriptionFrom(fetchFile)).resolves.toStrictEqual({
      data: { tilejson: '3.0.0', tiles: ['planet/{z}/{x}/{y}'] }
    });
  });

  it('comes from the backup when the planet is blocked', async () => {
    const fetchFile = answering({ [BACKUP]: description('backup/{z}/{x}/{y}') });

    await expect(descriptionFrom(fetchFile)).resolves.toStrictEqual({
      data: { tilejson: '3.0.0', tiles: ['backup/{z}/{x}/{y}'] }
    });
  });

  it('comes from the backup when the planet answers with an error', async () => {
    const fetchFile = answering({
      [PLANET]: new Response('', { status: 503 }),
      [BACKUP]: description('backup/{z}/{x}/{y}')
    });

    await expect(descriptionFrom(fetchFile)).resolves.toStrictEqual({
      data: { tilejson: '3.0.0', tiles: ['backup/{z}/{x}/{y}'] }
    });
  });

  it('fails when neither the planet nor the backup answers', async () => {
    const fetchFile = answering({ [BACKUP]: new Response('', { status: 503 }) });

    await expect(descriptionFrom(fetchFile)).rejects.toThrow(`${BACKUP} answered 503`);
  });
});
