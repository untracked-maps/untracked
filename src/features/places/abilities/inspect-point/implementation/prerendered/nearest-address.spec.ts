import { defer, firstValueFrom, type Observable, of, throwError } from 'rxjs';
import { describe, expect, it } from 'vitest';
import type { Coordinates, SpotAddress } from '../../domain/inspect-point';
import { nearestAddress } from './nearest-address';
import type { KnownAddress, LoadAddresses } from './prerendered-addresses';

const METRES_PER_DEGREE = 111_320;

const EQUATOR: Coordinates = { longitude: 0, latitude: 0 };

const streetNamed = (street: string): KnownAddress['address'] => ({
  street,
  postalCode: '00000',
  addressLocality: 'Null Island',
  addressCountry: 'FR'
});

const northOfTheEquator = (street: string, metres: number): KnownAddress => ({
  address: streetNamed(street),
  coordinates: { longitude: 0, latitude: metres / METRES_PER_DEGREE }
});

const addressAt = (spot: Coordinates, addresses: readonly KnownAddress[]): Promise<SpotAddress> =>
  firstValueFrom(nearestAddress(() => of(addresses))(spot));

const counting = (
  answers: readonly (() => Observable<readonly KnownAddress[]>)[]
): { readonly loads: () => number; readonly loadAddresses: LoadAddresses } => {
  const asked: number[] = [];
  return {
    loads: (): number => asked.length,
    loadAddresses: (): Observable<readonly KnownAddress[]> =>
      defer(() => {
        asked.push(asked.length);
        return answers[asked.length - 1]?.() ?? of([]);
      })
  };
};

describe('nearest address, by distance', () => {
  it('gives the nearest address', async () => {
    expect(await addressAt(EQUATOR, [northOfTheEquator('2 Rue Far', 150), northOfTheEquator('1 Rue Near', 50)])).toEqual({
      kind: 'address',
      address: streetNamed('1 Rue Near')
    });
  });

  it('keeps the nearest address when farther ones follow', async () => {
    expect(await addressAt(EQUATOR, [northOfTheEquator('1 Rue Near', 50), northOfTheEquator('2 Rue Far', 150)])).toEqual({
      kind: 'address',
      address: streetNamed('1 Rue Near')
    });
  });

  it('measures from a spot away from the prime meridian', async () => {
    const spot: Coordinates = { longitude: 2, latitude: 0 };
    const eastward: KnownAddress = {
      address: streetNamed('1 East Street'),
      coordinates: { longitude: 2 + 150 / METRES_PER_DEGREE, latitude: 0 }
    };

    expect(await addressAt(spot, [eastward])).toEqual({ kind: 'address', address: streetNamed('1 East Street') });
  });

  it('gives the first of two addresses as near as each other', async () => {
    expect(await addressAt(EQUATOR, [northOfTheEquator('1 Rue First', 50), northOfTheEquator('2 Rue Second', 50)])).toEqual({
      kind: 'address',
      address: streetNamed('1 Rue First')
    });
  });

  it('gives an address 200 metres away', async () => {
    expect(await addressAt(EQUATOR, [northOfTheEquator('1 Rue Edge', 200)])).toEqual({
      kind: 'address',
      address: streetNamed('1 Rue Edge')
    });
  });

  it('gives no address farther than 200 metres', async () => {
    expect(await addressAt(EQUATOR, [northOfTheEquator('1 Rue Away', 201)])).toEqual({ kind: 'no-address' });
  });

  it('measures longitudes shorter away from the equator', async () => {
    const sixtyNorth: Coordinates = { longitude: 0, latitude: 60 };
    const eastward: KnownAddress = {
      address: streetNamed('1 Nordic Street'),
      coordinates: { longitude: 380 / METRES_PER_DEGREE, latitude: 60 }
    };

    expect(await addressAt(sixtyNorth, [eastward])).toEqual({ kind: 'address', address: streetNamed('1 Nordic Street') });
  });

  it('measures longitudes westward too', async () => {
    const westward: KnownAddress = {
      address: streetNamed('1 West Street'),
      coordinates: { longitude: -250 / METRES_PER_DEGREE, latitude: 0 }
    };

    expect(await addressAt(EQUATOR, [westward])).toEqual({ kind: 'no-address' });
  });
});

describe('nearest address, once loaded', () => {
  it('gives no address when none is known', async () => {
    expect(await addressAt(EQUATOR, [])).toEqual({ kind: 'no-address' });
  });

  it('loads the addresses only once for several spots', async () => {
    const { loads, loadAddresses } = counting([
      (): Observable<readonly KnownAddress[]> => of([northOfTheEquator('1 Rue Near', 50)])
    ]);
    const reverseGeocode = nearestAddress(loadAddresses);
    await firstValueFrom(reverseGeocode(EQUATOR));
    await firstValueFrom(reverseGeocode(EQUATOR));

    expect(loads()).toBe(1);
  });

  it('loads the addresses again after a failure', async () => {
    const { loadAddresses } = counting([
      (): Observable<never> => throwError(() => new Error('The addresses file answered 500.')),
      (): Observable<readonly KnownAddress[]> => of([northOfTheEquator('1 Rue Near', 50)])
    ]);
    const reverseGeocode = nearestAddress(loadAddresses);
    await firstValueFrom(reverseGeocode(EQUATOR)).catch(() => undefined);

    expect(await firstValueFrom(reverseGeocode(EQUATOR))).toEqual({ kind: 'address', address: streetNamed('1 Rue Near') });
  });

  it('loads no address before a spot is inspected', () => {
    const { loads, loadAddresses } = counting([]);
    nearestAddress(loadAddresses);

    expect(loads()).toBe(0);
  });
});
