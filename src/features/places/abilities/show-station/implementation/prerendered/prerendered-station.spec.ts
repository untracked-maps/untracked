import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { prerenderedStation } from './prerendered-station';

const answering =
  (body: unknown, status = 200) =>
  (): Promise<Response> =>
    Promise.resolve(new Response(JSON.stringify(body), { status }));

const urlOf = (id: string): string => `/data/stations/${id}.json`;

const AT = { longitude: 2.355, latitude: 48.88 };

describe('a station read from its prerendered file', () => {
  it('gives the lines and the exits of the station', async () => {
    const file = {
      lines: [{ id: 'metro-4', tags: { ref: '4' }, directions: ['Porte de Clignancourt'] }],
      exits: [{ coordinates: AT, tags: { ref: '1' } }]
    };
    expect(await firstValueFrom(prerenderedStation(answering(file), urlOf)('gare-du-nord'))).toEqual({
      id: 'gare-du-nord',
      lines: [{ id: 'metro-4', tags: { ref: '4' }, directions: ['Porte de Clignancourt'] }],
      exits: [{ coordinates: AT, tags: { ref: '1' } }]
    });
  });

  it('reads the file of the station asked', async () => {
    const urls: string[] = [];
    const fetchFile = (url: string): Promise<Response> => {
      urls.push(url);
      return answering({})();
    };
    await firstValueFrom(prerenderedStation(fetchFile, urlOf)('gare-de-lyon'));
    expect(urls).toEqual(['/data/stations/gare-de-lyon.json']);
  });

  it('leaves out what it cannot read', async () => {
    const file = {
      lines: [{ tags: {} }, { id: 'rer-b', tags: 'B', directions: 'Massy' }, { id: 'rer-d', tags: { ref: 'D', colour: 1 } }],
      exits: [{ tags: {} }, { coordinates: { longitude: '2.35' } }, 'exit', { coordinates: AT }]
    };
    expect(await firstValueFrom(prerenderedStation(answering(file), urlOf)('nord'))).toEqual({
      id: 'nord',
      lines: [
        { id: 'rer-b', tags: {}, directions: [] },
        { id: 'rer-d', tags: { ref: 'D' }, directions: [] }
      ],
      exits: [{ coordinates: AT, tags: {} }]
    });
  });

  it('is empty when the file holds no station', async () => {
    expect(await firstValueFrom(prerenderedStation(answering(null), urlOf)('nord'))).toEqual({
      id: 'nord',
      lines: [],
      exits: []
    });
  });

  it('fails when the station has no file', async () => {
    await expect(firstValueFrom(prerenderedStation(answering({}, 404), urlOf)('flore'))).rejects.toThrow(
      'The station file answered 404.'
    );
  });
});
