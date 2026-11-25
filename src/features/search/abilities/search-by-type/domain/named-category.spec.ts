import type { Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import type { CategoryKey } from './categories';
import type { FindCategory } from './category-words';
import { type LoadCategoryFinder, namedCategory } from './named-category';

const CATEGORIES: Readonly<Record<string, CategoryKey>> = {
  boulangerie: 'bakeries',
  boulangeries: 'bakeries',
  pharmacie: 'pharmacies'
};

const findCategory: FindCategory = (query) => CATEGORIES[query];

type Inputs = {
  readonly wake?: string;
  readonly query: string;
  readonly loadCategoryFinder?: LoadCategoryFinder;
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
  ({ wake = 'w', query, loadCategoryFinder }: Inputs): Observable<CategoryKey | undefined> =>
    namedCategory({
      loadCategoryFinder: loadCategoryFinder ?? ((): Observable<FindCategory> => cold('f', { f: findCategory }))
    })({
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
      helpers.expectObservable(kindsOf(helpers)({ query: '-b' })).toBe('nb', { n: undefined, b: 'bakeries' });
    });
  });

  it('is none once the visitor types more than a kind', () => {
    scheduler().run((helpers) => {
      helpers.expectObservable(kindsOf(helpers)({ query: '-b-g' })).toBe('nb-n', { n: undefined, b: 'bakeries' });
    });
  });

  it('is told once while the visitor keeps naming the same kind', () => {
    scheduler().run((helpers) => {
      helpers.expectObservable(kindsOf(helpers)({ query: '-b-s-p' })).toBe('nb---p', {
        n: undefined,
        b: 'bakeries',
        p: 'pharmacies'
      });
    });
  });

  it('is found once the words arrive, for what the visitor typed before', () => {
    scheduler().run((helpers) => {
      helpers
        .expectObservable(
          kindsOf(helpers)({ query: '-b', loadCategoryFinder: () => helpers.cold('---f', { f: findCategory }) })
        )
        .toBe('n--b', { n: undefined, b: 'bakeries' });
    });
  });

  it('is none when the words cannot be loaded', () => {
    scheduler().run((helpers) => {
      helpers
        .expectObservable(kindsOf(helpers)({ query: '-b', loadCategoryFinder: () => helpers.cold('#') }))
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
      const finder$ = helpers.cold('f', { f: findCategory });
      helpers.expectObservable(kindsOf(helpers)({ wake: '--w', query: '', loadCategoryFinder: () => finder$ }));
      helpers.expectSubscriptions(finder$.subscriptions).toBe('--(^!)');
    });
  });

  it('stop watching the search field once nobody watches the kind named', () => {
    scheduler().run((helpers) => {
      const query$ = helpers.hot('-b');
      helpers.expectObservable(
        namedCategory({ loadCategoryFinder: () => helpers.cold('f', { f: findCategory }) })({
          wake: helpers.hot('w'),
          query: query$
        }),
        '^--!'
      );
      helpers.expectSubscriptions(query$.subscriptions).toBe('^--!');
    });
  });

  it('are loaded once, however often the search wakes and is watched', () => {
    scheduler().run((helpers) => {
      const finder$ = helpers.cold('f', { f: findCategory });
      const kinds$ = kindsOf(helpers)({ wake: '-ww', query: '--b', loadCategoryFinder: () => finder$ });
      helpers.expectObservable(kinds$);
      helpers.expectObservable(kinds$);
      helpers.expectSubscriptions(finder$.subscriptions).toBe('-(^!)');
    });
  });
});
