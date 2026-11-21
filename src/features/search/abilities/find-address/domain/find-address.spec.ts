import { map, type Observable, of, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import type { FindFound, Found } from '../../../domain/found';
import type { Place } from '../../../domain/place';
import { findAddress, type IndexAddresses, type LoadAddresses } from './find-address';
import type { KnownAddress } from './known-address';
import { withAddressesOf } from './with-addresses';

const HERE = { longitude: 2.35, latitude: 48.85 };

const SQUARE: Place = {
  id: 'square',
  name: 'Square Rivoli',
  kind: 'park',
  address: { postalCode: '75001', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: HERE,
  fame: 0
};

const STREET: KnownAddress = {
  kind: 'street',
  street: 'Rue de Rivoli',
  postcode: '75001',
  city: 'Paris',
  country: 'FR',
  coordinates: HERE
};

const findingSquare: FindFound = () => [SQUARE];

const indexing: IndexAddresses = (addresses) => of(withAddressesOf(addresses));

const loading: LoadAddresses = () => of([STREET]);

const failing: LoadAddresses = () => throwError(() => new Error('The addresses file answered 500.'));

type Run = Parameters<Parameters<TestScheduler['run']>[0]>[0];

const scheduled = (assertion: (run: Run) => void): void =>
  new TestScheduler((actual, expected) => expect(actual).toEqual(expected)).run(assertion);

const namesOf = (findFound: FindFound): readonly string[] => findFound('rue de rivoli', HERE).map(({ name }: Found) => name);

const found = (loadAddresses: LoadAddresses, findPlaces$: Observable<FindFound>): Observable<readonly string[]> =>
  findAddress({ loadAddresses, indexAddresses: indexing })(findPlaces$).pipe(map(namesOf));

describe('find an address', () => {
  it('adds the addresses to the places found', () => {
    scheduled(({ cold, expectObservable }) => {
      expectObservable(found(loading, cold('-f|', { f: findingSquare }))).toBe('-n|', {
        n: ['Rue de Rivoli', 'Square Rivoli']
      });
    });
  });

  it('finds the places alone when the addresses cannot be loaded', () => {
    scheduled(({ cold, expectObservable }) => {
      expectObservable(found(failing, cold('-f|', { f: findingSquare }))).toBe('-n|', { n: ['Square Rivoli'] });
    });
  });

  it('waits for the addresses before finding', () => {
    scheduled(({ cold, expectObservable }) => {
      expectObservable(found(() => cold('---a|', { a: [STREET] }), cold('-f|', { f: findingSquare }))).toBe('---(n|)', {
        n: ['Rue de Rivoli', 'Square Rivoli']
      });
    });
  });

  it('indexes the addresses once', () => {
    scheduled(({ cold, expectObservable }) => {
      expectObservable(found(() => cold('-ab|', { a: [STREET], b: [] }), cold('f|', { f: findingSquare }))).toBe('-(n|)', {
        n: ['Rue de Rivoli', 'Square Rivoli']
      });
    });
  });
});
