import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import type { Departure } from '../../domain/next-departures';
import type { LoadDepartures } from '../../domain/show-station';
import { fakeDepartures } from './fake-departures';

const NOW = Date.parse('2026-11-24T10:00:00Z');

const tagged = (entries: readonly (readonly [string, string])[]): Readonly<Record<string, string>> =>
  Object.fromEntries(entries);

const METRO = {
  id: 'metro-4',
  tags: tagged([
    ['route_master', 'subway'],
    ['network', 'Métro de Paris']
  ]),
  directions: ['North']
};

const RER = {
  id: 'rer-b',
  tags: tagged([
    ['route_master', 'train'],
    ['network', 'RER']
  ]),
  directions: ['South']
};

const TRANSILIEN = {
  id: 'transilien-h',
  tags: tagged([
    ['route_master', 'train'],
    ['network', 'Transilien']
  ]),
  directions: ['West']
};

type FileLine = typeof METRO;

const askedAt = async (lines: readonly FileLine[], now: number): Promise<readonly Departure[]> =>
  await firstValueFrom(
    fakeDepartures({
      fetchFile: () => Promise.resolve(Response.json({ lines, exits: [] })),
      urlOf: (id) => `/data/stations/${id}.json`,
      now: () => now,
      failingAt: []
    })(NORD)
  );

const timesOf = async (line: FileLine): Promise<readonly string[]> =>
  (await askedAt([line], NOW)).map(({ aimedDepartureTime }) => aimedDepartureTime);

const stationFile = (): Promise<Response> => Promise.resolve(Response.json({ lines: [METRO], exits: [] }));

const service = (failingAt: readonly string[] = []): LoadDepartures =>
  fakeDepartures({ fetchFile: stationFile, urlOf: (id) => `/data/stations/${id}.json`, now: () => NOW, failingAt });

const NORD = { id: 'gare-du-nord', lines: [], exits: [] };

describe('the fake departures of a line', () => {
  it('leave every 4 minutes on the metro', async () => {
    expect(await timesOf(METRO)).toEqual([
      '2026-11-24T10:03:00.000Z',
      '2026-11-24T10:07:00.000Z',
      '2026-11-24T10:11:00.000Z',
      '2026-11-24T10:15:00.000Z'
    ]);
  });

  it('leave every 8 minutes on the RER', async () => {
    expect(await timesOf(RER)).toEqual([
      '2026-11-24T10:03:00.000Z',
      '2026-11-24T10:11:00.000Z',
      '2026-11-24T10:19:00.000Z',
      '2026-11-24T10:27:00.000Z'
    ]);
  });

  it('leave every 15 minutes on other trains', async () => {
    expect(await timesOf(TRANSILIEN)).toEqual([
      '2026-11-24T10:14:00.000Z',
      '2026-11-24T10:29:00.000Z',
      '2026-11-24T10:44:00.000Z',
      '2026-11-24T10:59:00.000Z'
    ]);
  });

  it('delay the second departure of the RER by 2 minutes', async () => {
    expect((await askedAt([RER], NOW))[1]).toEqual({
      lineRef: 'rer-b',
      destinationName: 'South',
      aimedDepartureTime: '2026-11-24T10:11:00.000Z',
      expectedDepartureTime: '2026-11-24T10:13:00.000Z',
      departureStatus: 'delayed',
      monitored: true
    });
  });
});

describe('the fake departures delayed or cancelled', () => {
  it('delay no departure of the metro', async () => {
    expect((await askedAt([METRO], NOW)).map(({ departureStatus }) => departureStatus)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined
    ]);
  });

  it('leave the first departure of the RER on time', async () => {
    expect((await askedAt([RER], NOW))[0]?.expectedDepartureTime).toBeUndefined();
  });

  it('cancel only the third departure of a Transilien line', async () => {
    expect((await askedAt([TRANSILIEN], NOW)).map(({ departureStatus }) => departureStatus)).toEqual([
      undefined,
      undefined,
      'cancelled',
      undefined
    ]);
  });

  it('cancel the third departure of a Transilien line', async () => {
    expect((await askedAt([TRANSILIEN], NOW))[2]?.departureStatus).toBe('cancelled');
  });

  it('follow in real time the first departure only of a Transilien line', async () => {
    expect((await askedAt([TRANSILIEN], NOW)).map(({ monitored }) => monitored)).toEqual([true, false, false, false]);
  });

  it('follow in real time every departure of the metro', async () => {
    expect((await askedAt([METRO], NOW)).every(({ monitored }) => monitored)).toBe(true);
  });

  it('keep a departure gone for less than 30 seconds', async () => {
    expect((await askedAt([METRO], Date.parse('2026-11-24T10:03:20Z')))[0]?.aimedDepartureTime).toBe(
      '2026-11-24T10:03:00.000Z'
    );
  });

  it('leave without a line without directions', async () => {
    expect(await askedAt([{ ...METRO, directions: [] }], NOW)).toEqual([]);
  });

  it('read a line without mode nor network as another train', async () => {
    expect((await timesOf({ ...METRO, tags: {} }))[1]).toBe('2026-11-24T10:16:00.000Z');
  });
});

describe('the fake departures service', () => {
  it('answers with the departures of the lines of the station file', async () => {
    expect(await firstValueFrom(service()(NORD))).toEqual(await askedAt([METRO], NOW));
  });

  it('fails for a station it is told to fail for', async () => {
    await expect(firstValueFrom(service(['gare-du-nord'])(NORD))).rejects.toThrow(
      'The fake departures service fails for this station.'
    );
  });
});
