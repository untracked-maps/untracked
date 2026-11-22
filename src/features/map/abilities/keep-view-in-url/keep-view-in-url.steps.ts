import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { firstValueFrom, lastValueFrom, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { linkInUrl, linkKept } from './domain/followed-link';
import { keepViewInUrl, viewInUrl } from './domain/keep-view-in-url';
import { type Linked, linkTo } from './domain/link-fragment';
import type { MapView } from './domain/view-fragment';

type UrlWorld = World & {
  hash: string;
  requestedView: MapView | undefined;
  followed: Linked | undefined;
  page: string;
  sharedLink: string;
  keptHash: string;
  writtenHashes: readonly string[];
};

Given('a link whose hash is {string}', function aLinkWhoseHashIs(this: UrlWorld, hash: string) {
  this.hash = hash;
});

When('the visitor follows the link', async function theVisitorFollowsTheLink(this: UrlWorld) {
  this.requestedView = await firstValueFrom(viewInUrl({ readFragment: () => of(this.hash) })(), {
    defaultValue: undefined
  });
  this.followed = await firstValueFrom(linkInUrl({ readFragment: () => of(this.hash) })(), { defaultValue: undefined });
});

const linkFollowedThen = (closing: string, view: MapView): readonly string[] => {
  const written: string[] = [];
  new TestScheduler(() => undefined).run(({ cold, hot }) => {
    keepViewInUrl({ writeFragment: (fragment) => of(fragment) })(
      hot('v', { v: view }),
      hot(''),
      linkKept(cold('(l|)', { l: { kind: 'place', id: 'paris-0001' } }), hot(`t ${closing}`, { t: true, f: false }))
    ).subscribe((fragment) => {
      written.push(fragment);
    });
  });
  return written;
};

When(
  'the visitor follows a link to a place, its sheet opens and the map moves to zoom level {float} on {float}, {float}',
  function theVisitorFollowsLinkAndMoves(this: UrlWorld, zoom: number, latitude: number, longitude: number) {
    this.writtenHashes = linkFollowedThen('', { center: { longitude, latitude }, zoom });
  }
);

When(
  'the visitor follows a link to a place, its sheet opens and the map moves to zoom level {float} on {float}, {float}, then the sheet closes',
  function theVisitorFollowsLinkMovesAndCloses(this: UrlWorld, zoom: number, latitude: number, longitude: number) {
    this.writtenHashes = linkFollowedThen('1s f', { center: { longitude, latitude }, zoom });
  }
);

Given('the page {string} is open', function thePageIsOpen(this: UrlWorld, page: string) {
  this.page = page;
});

When(
  'the visitor shares the place {string} at {float}, {float}',
  function theVisitorSharesThePlace(this: UrlWorld, place: string, latitude: number, longitude: number) {
    this.sharedLink = linkTo(this.page, { at: { longitude, latitude }, place });
  }
);

When(
  'the visitor shares the spot at {float}, {float}',
  function theVisitorSharesTheSpot(this: UrlWorld, latitude: number, longitude: number) {
    this.sharedLink = linkTo(this.page, { at: { longitude, latitude } });
  }
);

When(
  'the visitor moves the map to zoom level {float} on {float}, {float}',
  async function theVisitorMovesTheMapTo(this: UrlWorld, zoom: number, latitude: number, longitude: number) {
    this.keptHash = await lastValueFrom(
      keepViewInUrl({ writeFragment: (fragment) => of(fragment) })(of({ center: { longitude, latitude }, zoom }))
    );
  }
);

When(
  'the visitor moves the map to zoom level {float} on {float}, {float}, then steps back in the history',
  function theVisitorMovesTheMapThenStepsBack(this: UrlWorld, zoom: number, latitude: number, longitude: number) {
    const written: string[] = [];
    new TestScheduler(() => undefined).run(({ hot }) => {
      keepViewInUrl({ writeFragment: (fragment) => of(fragment) })(
        hot('v', { v: { center: { longitude, latitude }, zoom } }),
        hot('1s s')
      ).subscribe((fragment) => {
        written.push(fragment);
      });
    });
    this.writtenHashes = written;
  }
);

Then(
  'the link asks for zoom level {float} on {float}, {float}',
  function theLinkAsksFor(this: UrlWorld, zoom: number, latitude: number, longitude: number) {
    assert.deepEqual(this.requestedView, { center: { longitude, latitude }, zoom });
  }
);

Then('the link asks for no view', function theLinkAsksForNoView(this: UrlWorld) {
  assert.equal(this.requestedView, undefined);
});

Then('the URL hash becomes {string}', function theUrlHashBecomes(this: UrlWorld, hash: string) {
  assert.equal(this.keptHash, hash);
});

Then('the URL hash is written again as {string}', function theUrlHashIsWrittenAgainAs(this: UrlWorld, hash: string) {
  assert.deepEqual(this.writtenHashes, [hash, hash]);
});

Then(
  'the link opens the place {string} at {float}, {float}',
  function theLinkOpensThePlaceAt(this: UrlWorld, id: string, latitude: number, longitude: number) {
    assert.deepEqual(this.followed, { kind: 'place', id, at: { longitude, latitude } });
  }
);

Then('the link opens the place {string} without a position', function theLinkOpensThePlace(this: UrlWorld, id: string) {
  assert.deepEqual(this.followed, { kind: 'place', id });
});

Then(
  'the link opens the spot at {float}, {float}',
  function theLinkOpensTheSpotAt(this: UrlWorld, latitude: number, longitude: number) {
    assert.deepEqual(this.followed, { kind: 'point', at: { longitude, latitude } });
  }
);

Then('the link opens nothing', function theLinkOpensNothing(this: UrlWorld) {
  assert.equal(this.followed, undefined);
});

Then('the link shared is {string}', function theLinkSharedIs(this: UrlWorld, link: string) {
  assert.equal(this.sharedLink, link);
});

Then('the URL hash is not written', function theUrlHashIsNotWritten(this: UrlWorld) {
  assert.deepEqual(this.writtenHashes, []);
});

Then('the URL hash is written as {string}', function theUrlHashIsWrittenAs(this: UrlWorld, hash: string) {
  assert.deepEqual(this.writtenHashes, [hash]);
});
