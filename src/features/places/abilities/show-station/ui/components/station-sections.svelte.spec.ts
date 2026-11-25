import { BehaviorSubject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { LineDepartures } from '../../domain/next-departures';
import type { StationView } from '../../domain/show-station';
import type { Coordinates, StationExit } from '../../domain/station-exits';
import StationSections from './station-sections.svelte';

const AT = { longitude: 2.355, latitude: 48.88 };

const METRO_4: LineDepartures = {
  ref: '4',
  mode: 'subway',
  destination: 'Porte de Clignancourt',
  colour: '#cf009e',
  textColour: '#ffffff',
  times: [{ told: 'at platform' }, { told: 'minutes', minutes: 4 }],
  live: true
};

const RER_B: LineDepartures = { ...METRO_4, ref: 'B', mode: 'train', network: 'RER', destination: 'Massy', live: false };

const exitsOf = (count: number): readonly StationExit[] =>
  Array.from({ length: count }, (_, index) => ({ ref: `${index + 1}`, name: `Rue ${index + 1}`, coordinates: AT }));

const open = (departures: Extract<StationView, { status: 'open' }>['departures'], exits = exitsOf(2)): StationView => ({
  status: 'open',
  id: 'nord',
  exits,
  departures
});

const shown = async (view: StationView, onExit = (_at: Coordinates): void => undefined): Promise<unknown> =>
  await render(StationSections, { station: new BehaviorSubject(view), onExit, locale: 'en' });

const AN_EXIT = /^Exit/u;

const ALL_EXITS = /^All exits/u;

const KNOWN = open({ status: 'known', lines: [METRO_4, RER_B] });

describe('the passages of a station', () => {
  it('are left out while no station is open', async () => {
    await shown({ status: 'none' });
    await expect.element(page.getByRole('region', { name: 'Exits' })).not.toBeInTheDocument();
  });

  it('are left out while the departures are asked', async () => {
    await shown(open({ status: 'asked' }));
    await expect.element(page.getByRole('region', { name: 'Next departures' })).not.toBeInTheDocument();
  });

  it('name each line for screen readers', async () => {
    await shown(KNOWN);
    await expect.element(page.getByRole('img', { name: 'RER B' })).toHaveTextContent('B');
  });

  it('draw a metro line as a circle', async () => {
    await shown(KNOWN);
    await expect.element(page.getByRole('img', { name: 'Metro 4' })).toHaveClass('round');
  });
});

describe('the badges of the lines of a station', () => {
  it('draw a line other than the metro as a rounded rectangle', async () => {
    await shown(KNOWN);
    await expect.element(page.getByRole('img', { name: 'RER B' })).not.toHaveClass('round');
  });

  it('round the corners of a line other than the metro by 7 px', async () => {
    await shown(KNOWN);
    await expect.element(page.getByRole('img', { name: 'RER B' })).toHaveStyle({ borderTopLeftRadius: '7px' });
  });

  it('write the number of a line in its text colour', async () => {
    await shown(KNOWN);
    await expect.element(page.getByRole('img', { name: 'Metro 4' })).toHaveStyle({ color: 'rgb(255, 255, 255)' });
  });

  it('draw a line in its colours', async () => {
    await shown(KNOWN);
    await expect.element(page.getByRole('img', { name: 'Metro 4' })).toHaveStyle({ backgroundColor: 'rgb(207, 0, 158)' });
  });

  it('tell the first time in bold', async () => {
    await shown(open({ status: 'known', lines: [METRO_4] }));
    await expect.element(page.getByText('at platform')).toHaveStyle({ fontWeight: '700' });
  });

  it('are titled', async () => {
    await shown(KNOWN);
    await expect.element(page.getByRole('heading', { name: 'Next departures' })).toBeInTheDocument();
  });

  it('tell the next times in a lighter way', async () => {
    await shown(open({ status: 'known', lines: [METRO_4] }));
    await expect.element(page.getByText('4 min')).toHaveClass('next');
  });

  it('tell the next times after the first one', async () => {
    await shown(open({ status: 'known', lines: [METRO_4] }));
    await expect.element(page.getByText('4 min')).toBeInTheDocument();
  });

  it('tell a line without departure in real time without a dot', async () => {
    await shown(open({ status: 'known', lines: [RER_B] }));
    await expect.element(page.getByRole('img', { name: 'Real time' })).not.toBeInTheDocument();
  });

  it('show a dot for a line in real time', async () => {
    await shown(KNOWN);
    await expect.element(page.getByRole('img', { name: 'Real time' })).toBeInTheDocument();
  });
});

describe('the passages of a station, when there are none', () => {
  it('say when the service fails', async () => {
    await shown(open({ status: 'unavailable' }));
    await expect
      .element(page.getByText('Times unavailable right now. Trying again automatically in 30 s.'))
      .toBeInTheDocument();
  });

  it('say when no departure is planned', async () => {
    await shown(open({ status: 'known', lines: [] }));
    await expect.element(page.getByText('No departures planned right now.')).toBeInTheDocument();
  });
});

describe('the exits of a station', () => {
  it('are left out when it has none', async () => {
    await shown(open({ status: 'asked' }, []));
    await expect.element(page.getByRole('region', { name: 'Exits' })).not.toBeInTheDocument();
  });

  it('are titled', async () => {
    await shown(open({ status: 'asked' }));
    await expect.element(page.getByRole('heading', { name: 'Exits' })).toBeInTheDocument();
  });

  it('show the first four', async () => {
    await shown(open({ status: 'asked' }, exitsOf(6)));
    expect(page.getByRole('button', { name: AN_EXIT }).elements()).toHaveLength(4);
  });

  it('show all of them in place once asked', async () => {
    await shown(open({ status: 'asked' }, exitsOf(6)));
    await page.getByRole('button', { name: 'All exits (6)' }).click();
    await expect.element(page.getByRole('button', { name: 'Exit 6 · Rue 6' })).toBeInTheDocument();
  });

  it('offer no more exits when all are shown', async () => {
    await shown(open({ status: 'asked' }, exitsOf(4)));
    await expect.element(page.getByRole('button', { name: ALL_EXITS })).not.toBeInTheDocument();
  });

  it('tell the access of an exit', async () => {
    await shown(open({ status: 'asked' }, [{ ref: '1', name: 'Rue de Dunkerque', access: 'escalator', coordinates: AT }]));
    await expect.element(page.getByRole('button', { name: 'Exit 1 · Rue de Dunkerque escalator' })).toBeInTheDocument();
  });

  it('show an exit on the map once touched', async () => {
    const touched: Coordinates[] = [];
    await shown(open({ status: 'asked' }), (at) => {
      touched.push(at);
    });
    await page.getByRole('button', { name: 'Exit 1 · Rue 1' }).click();
    expect(touched).toEqual([AT]);
  });
});
