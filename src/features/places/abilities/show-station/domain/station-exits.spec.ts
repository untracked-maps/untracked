import { describe, expect, it } from 'vitest';
import { type Exit, stationExits } from './station-exits';

const AT = { longitude: 2.355, latitude: 48.88 };

const exit = (tags: Exit['tags']): Exit => ({ coordinates: AT, tags });

describe('the exits of a station', () => {
  it('follow their numbers, 2 before 10', () => {
    expect(stationExits([exit({ ref: '10' }), exit({ ref: '2' })]).map(({ ref }) => ref)).toEqual(['2', '10']);
  });

  it('put the exits without number last', () => {
    expect(stationExits([exit({ name: 'Rue de Compiègne' }), exit({ ref: '1' })]).map(({ ref }) => ref)).toEqual([
      '1',
      undefined
    ]);
  });

  it('keep the exits without number among themselves', () => {
    expect(stationExits([exit({ name: 'A' }), exit({ name: 'B' })]).map(({ name }) => name)).toEqual(['A', 'B']);
  });

  it('tell an accessible exit before its escalator', () => {
    expect(stationExits([exit({ wheelchair: 'yes', conveying: 'yes' })])).toEqual([{ access: 'accessible', coordinates: AT }]);
  });

  it('tell an escalator', () => {
    expect(stationExits([exit({ conveying: 'yes' })])).toEqual([{ access: 'escalator', coordinates: AT }]);
  });

  it('tell nothing of an exit with steps only', () => {
    expect(stationExits([exit({ wheelchair: 'no', ref: '1', name: 'Rue de Dunkerque' })])).toEqual([
      { ref: '1', name: 'Rue de Dunkerque', coordinates: AT }
    ]);
  });
});
