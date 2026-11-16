import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import type { TransitLine } from '../../domain/show-transit-lines';
import { idfmTransitLines } from './idfm-transit-lines';
import { transitLinesFrom } from './transit-lines-file';

const EXPORT_URL =
  'https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/traces-du-reseau-ferre-idf/exports/geojson?select=geo_shape,mode,colourweb_hexa';

const PATH = [
  [2.2389, 48.8918],
  [2.4485, 48.8445]
];

const trace = (properties: unknown, geometry: unknown = { type: 'LineString', coordinates: PATH }): unknown => ({
  type: 'Feature',
  geometry,
  properties
});

const exportOf = (...features: readonly unknown[]): unknown => ({ type: 'FeatureCollection', features });

const fetchAnswering =
  (body: unknown, status = 200) =>
  (url: string): Promise<Response> =>
    Promise.resolve(url === EXPORT_URL ? new Response(JSON.stringify(body), { status }) : new Response(null, { status: 404 }));

const linesFrom = (body: unknown, status?: number): Promise<readonly TransitLine[]> =>
  transitLinesFrom(fetchAnswering(body, status));

const COLOUR = 'colourweb_hexa';

describe('transit lines of Île-de-France Mobilités', () => {
  it('turns a metro trace into a metro line in its official colour', async () => {
    expect(await linesFrom(exportOf(trace({ mode: 'METRO', [COLOUR]: 'ffcd00' })))).toStrictEqual([
      { mode: 'metro', colour: '#ffcd00', path: PATH }
    ]);
  });

  it('turns a RER trace into a RER line', async () => {
    expect((await linesFrom(exportOf(trace({ mode: 'RER' }))))[0]?.mode).toBe('rer');
  });

  it('turns a train trace into a train line', async () => {
    expect((await linesFrom(exportOf(trace({ mode: 'TRAIN' }))))[0]?.mode).toBe('train');
  });

  it('turns a regional train trace into a train line', async () => {
    expect((await linesFrom(exportOf(trace({ mode: 'TER' }))))[0]?.mode).toBe('train');
  });

  it('turns a tramway trace into a tram line', async () => {
    expect((await linesFrom(exportOf(trace({ mode: 'TRAMWAY' }))))[0]?.mode).toBe('tram');
  });

  it('keeps a trace of any other mode, such as a cable car', async () => {
    expect((await linesFrom(exportOf(trace({ mode: 'CABLE' }))))[0]?.mode).toBe('other');
  });

  it('leaves the colour of a line without an official colour to the map', async () => {
    expect((await linesFrom(exportOf(trace({ mode: 'TER', [COLOUR]: null }))))[0]?.colour).toBeUndefined();
  });

  it('leaves to the map a colour that is not a web colour', async () => {
    expect((await linesFrom(exportOf(trace({ [COLOUR]: 'url(x)ffcd00' }))))[0]?.colour).toBeUndefined();
  });

  it('leaves to the map a colour longer than a web colour', async () => {
    expect((await linesFrom(exportOf(trace({ [COLOUR]: 'ffcd00a' }))))[0]?.colour).toBeUndefined();
  });
});

describe('transit lines of Île-de-France Mobilités, from their traces', () => {
  it('keeps only the longitude and latitude of each point', async () => {
    const withAltitude = { type: 'LineString', coordinates: PATH.map(([x = 0, y = 0]) => [x, y, 35]) };

    expect((await linesFrom(exportOf(trace({}, withAltitude))))[0]?.path).toStrictEqual(PATH);
  });

  it('drops a trace that is not a line', async () => {
    expect(await linesFrom(exportOf(trace({}, { type: 'MultiPoint', coordinates: PATH })))).toStrictEqual([]);
  });

  it('drops a line with a point without a longitude', async () => {
    const broken = { type: 'LineString', coordinates: [...PATH, ['west', 48.8]] };

    expect(await linesFrom(exportOf(trace({}, broken)))).toStrictEqual([]);
  });

  it('drops a line of a single point', async () => {
    expect(await linesFrom(exportOf(trace({}, { type: 'LineString', coordinates: [PATH[0]] })))).toStrictEqual([]);
  });

  it('drops a line with a point that is not a position', async () => {
    const broken = { type: 'LineString', coordinates: [...PATH, [2.3, 'north']] };

    expect(await linesFrom(exportOf(trace({}, broken)))).toStrictEqual([]);
  });

  it('drops a line with a point without a latitude', async () => {
    const broken = { type: 'LineString', coordinates: [...PATH, [2.3]] };

    expect(await linesFrom(exportOf(trace({}, broken)))).toStrictEqual([]);
  });

  it('drops a line whose points are not a list', async () => {
    expect(await linesFrom(exportOf(trace({}, { type: 'LineString', coordinates: 'none' })))).toStrictEqual([]);
  });

  it('drops a line without points', async () => {
    expect(await linesFrom(exportOf(trace({}, { type: 'LineString' })))).toStrictEqual([]);
  });
});

describe('transit lines of Île-de-France Mobilités, from broken traces', () => {
  it('drops a trace without a geometry', async () => {
    expect(await linesFrom(exportOf({ type: 'Feature', properties: {} }))).toStrictEqual([]);
  });

  it('drops a trace whose geometry has no type', async () => {
    expect(await linesFrom(exportOf(trace({}, { coordinates: PATH })))).toStrictEqual([]);
  });

  it('drops a trace without properties', async () => {
    expect(await linesFrom(exportOf({ type: 'Feature', geometry: { type: 'LineString', coordinates: PATH } }))).toStrictEqual(
      []
    );
  });

  it('drops a trace whose properties are not an object', async () => {
    expect(await linesFrom(exportOf(trace('METRO')))).toStrictEqual([]);
  });

  it('drops a trace that is not an object', async () => {
    expect(await linesFrom(exportOf('METRO 1'))).toStrictEqual([]);
  });

  it('finds no line in a file without features', async () => {
    expect(await linesFrom({ type: 'FeatureCollection' })).toStrictEqual([]);
  });

  it('finds no line in a file whose features are not a list', async () => {
    expect(await linesFrom({ features: 'none' })).toStrictEqual([]);
  });

  it('finds no line in a file that is not an object', async () => {
    expect(await linesFrom('none')).toStrictEqual([]);
  });

  it('are loaded when first shown', async () => {
    expect(await firstValueFrom(idfmTransitLines(fetchAnswering(exportOf(trace({ mode: 'RER' }))))())).toHaveLength(1);
  });

  it('fails when Île-de-France Mobilités answers with an error', async () => {
    await expect(linesFrom(exportOf(), 503)).rejects.toThrow('Île-de-France Mobilités answered 503.');
  });
});
