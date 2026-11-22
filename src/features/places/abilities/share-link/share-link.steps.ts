import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { type Observable, of, throwError } from 'rxjs';
import { type SharedLink, type ShareUrl, shareLink } from './domain/share-link';

type ShareWorld = World & {
  noShareSheet: boolean;
  shareAnswer: 'shared' | 'cancelled' | 'failed' | undefined;
  copyRefused: boolean;
  given: SharedLink[];
  copied: string[];
  shared: string;
};

const shareSheet =
  (world: ShareWorld): ShareUrl =>
  (link): Observable<'shared' | 'cancelled'> => {
    world.given.push(link);
    const answer = world.shareAnswer ?? 'shared';
    return answer === 'failed' ? throwError(() => new Error('The share sheet failed.')) : of(answer);
  };

const copyText =
  (world: ShareWorld) =>
  (text: string): Observable<void> => {
    if (world.copyRefused) {
      return throwError(() => new Error('The clipboard refused.'));
    }
    world.copied.push(text);
    return of(undefined);
  };

Given('the device has no share sheet', function theDeviceHasNoShareSheet(this: ShareWorld) {
  this.noShareSheet = true;
});

Given('the visitor will close the share sheet', function theVisitorWillCloseTheShareSheet(this: ShareWorld) {
  this.shareAnswer = 'cancelled';
});

Given('the share sheet will fail', function theShareSheetWillFail(this: ShareWorld) {
  this.shareAnswer = 'failed';
});

Given('the device refuses to copy the link', function theDeviceRefusesToCopy(this: ShareWorld) {
  this.copyRefused = true;
});

When('the visitor shares {string} at {string}', function theVisitorShares(this: ShareWorld, title: string, url: string) {
  this.given = [];
  this.copied = [];
  const ports = this.noShareSheet ? { copyText: copyText(this) } : { shareUrl: shareSheet(this), copyText: copyText(this) };
  shareLink(ports)(of({ title, url })).subscribe((shared) => {
    this.shared = shared;
  });
});

Then('the share sheet gets {string} and {string}', function theShareSheetGets(this: ShareWorld, title: string, url: string) {
  assert.deepEqual(this.given, [{ title, url }]);
});

Then('{string} is copied as the link', function isCopiedAsTheLink(this: ShareWorld, url: string) {
  assert.deepEqual(this.copied, [url]);
});

Then('the visitor is told that the link is shared', function theVisitorIsToldItIsShared(this: ShareWorld) {
  assert.equal(this.shared, 'shared');
});

Then('the visitor is told that the share is cancelled', function theVisitorIsToldItIsCancelled(this: ShareWorld) {
  assert.equal(this.shared, 'cancelled');
});

Then('the visitor is told that the link is copied', function theVisitorIsToldTheLinkIsCopied(this: ShareWorld) {
  assert.equal(this.shared, 'copied');
});

Then('the visitor is told that the link could not be copied', function theVisitorIsToldTheLinkIsNotCopied(this: ShareWorld) {
  assert.equal(this.shared, 'not copied');
});
