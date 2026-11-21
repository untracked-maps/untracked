import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { firstValueFrom, lastValueFrom, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { keepViewInUrl, viewInUrl } from './domain/keep-view-in-url';
import type { MapView } from './domain/view-fragment';

type UrlWorld = World & {
  hash: string;
  requestedView: MapView | undefined;
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
});

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
