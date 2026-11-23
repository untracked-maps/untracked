import { type Observable, of, throwError } from 'rxjs';
import { describe, expect, it } from 'vitest';
import type { CopyText } from '../../domain/open-place';
import { addressCopying } from './address-copying';

const ADDRESS = '172 Boulevard Saint-Germain, 75006 Paris';

const refused = (): Observable<never> => throwError(() => new Error('Refused.'));

const toldWith = (copyText: CopyText): readonly string[] => {
  const told: string[] = [];
  addressCopying({ copyText }, ({ text }) => {
    told.push(text);
  })(ADDRESS);
  return told;
};

describe('copying an address', () => {
  it('tells the visitor when the address could not be copied', () => {
    expect(toldWith(refused)).toEqual(['The address could not be copied']);
  });

  it('tells nothing once the address is copied', () => {
    expect(toldWith(() => of(undefined))).toEqual([]);
  });
});
