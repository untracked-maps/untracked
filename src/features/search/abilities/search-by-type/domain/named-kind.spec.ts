import type { Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import type { PlaceKind } from '../../../domain/place';
import type { FindKind } from './kind-words';
import { type LoadKindFinder, namedKind } from './named-kind';

const KINDS: Readonly<Record<string, PlaceKind>> = { boulangerie: 'bakery', boulangeries: 'bakery', pharmacie: 'pharmacy' };

const findKind: FindKind = (query) => KINDS[query];

type Inputs = {
  readonly wake?: string;
  readonly query: string;
  readonly loadKindFinder?: LoadKindFinder;
};

const QUERIES: Readonly<Record<string, string>> = {
  b: 'boulangerie',
  s: 'boulangeries',
  g: 'boulangerie garcia',
  p: 'pharmacie'
};

type Helpers = Pick<Parameters<Parameters<TestScheduler['run']>[0]>[0], 'hot' | 'cold'>;

const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

const kindsOf =
  ({ hot, cold }: Helpers) =>
  ({ wake = 'w', query, loadKindFinder }: Inputs): Observable<PlaceKind | undefined> =>
    namedKind({ loadKindFinder: loadKindFinder ?? ((): Observable<FindKind> => cold('f', { f: findKind })) })({
      wake: hot(wake, { w: undefined }),
      query: hot(query, QUERIES)
    });

describe('kind named in the search field', () => {
  it('is none before the visitor types', () => {
    scheduler().run((helpers) => {
      helpers.expectObservable(kindsOf(helpers)({ query: '---' })).toBe('n', { n: undefined });
    });
  });

  it('is the kind the visitor types', () => {
    scheduler().run((helpers) => {
      helpers.expectObservable(kindsOf(helpers)({ query: '-b' })).toBe('nb', { n: undefined, b: 'bakery' });
    });
  });

  it('is none once the visitor types more than a kind', () => {
    scheduler().run((helpers) => {
      helpers.expectObservable(kindsOf(helpers)({ query: '-b-g' })).toBe('nb-n', { n: undefined, b: 'bakery' });
    });
  });

  it('is told once while the visitor keeps naming the same kind', () => {
    scheduler().run((helpers) => {
      helpers.expectObservable(kindsOf(helpers)({ query: '-b-s-p' })).toBe('nb---p', {
        n: undefined,
        b: 'bakery',
        p: 'pharmacy'
      });
    });
  });

  it('is found once the words arrive, for what the visitor typed before', () => {
    scheduler().run((helpers) => {
      helpers
        .expectObservable(kindsOf(helpers)({ query: '-b', loadKindFinder: () => helpers.cold('---f', { f: findKind }) }))
        .toBe('n--b', { n: undefined, b: 'bakery' });
    });
  });

  it('is none when the words cannot be loaded', () => {
    scheduler().run((helpers) => {
      helpers
        .expectObservable(kindsOf(helpers)({ query: '-b', loadKindFinder: () => helpers.cold('#') }))
        .toBe('n', { n: undefined });
    });
  });

  it('is none before the search wakes', () => {
    scheduler().run((helpers) => {
      helpers.expectObservable(kindsOf(helpers)({ wake: '---', query: '-b' })).toBe('n', { n: undefined });
    });
  });
});

describe('words of the kinds', () => {
  it('wait for the search to wake', () => {
    scheduler().run((helpers) => {
      const finder$ = helpers.cold('f', { f: findKind });
      helpers.expectObservable(kindsOf(helpers)({ wake: '--w', query: '', loadKindFinder: () => finder$ }));
      helpers.expectSubscriptions(finder$.subscriptions).toBe('--(^!)');
    });
  });

  it('stop watching the search field once nobody watches the kind named', () => {
    scheduler().run((helpers) => {
      const query$ = helpers.hot('-b');
      helpers.expectObservable(
        namedKind({ loadKindFinder: () => helpers.cold('f', { f: findKind }) })({ wake: helpers.hot('w'), query: query$ }),
        '^--!'
      );
      helpers.expectSubscriptions(query$.subscriptions).toBe('^--!');
    });
  });

  it('are loaded once, however often the search wakes and is watched', () => {
    scheduler().run((helpers) => {
      const finder$ = helpers.cold('f', { f: findKind });
      const kinds$ = kindsOf(helpers)({ wake: '-ww', query: '--b', loadKindFinder: () => finder$ });
      helpers.expectObservable(kinds$);
      helpers.expectObservable(kinds$);
      helpers.expectSubscriptions(finder$.subscriptions).toBe('-(^!)');
    });
  });
});
