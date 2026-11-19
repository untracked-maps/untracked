import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { type Notice, showNotice } from './domain/show-notice';

type Step = {
  readonly at: number;
  readonly notice?: Notice;
};

type NoticeWorld = World & {
  now?: number;
  steps?: readonly Step[];
};

const SECOND = 1000;

const told = (world: NoticeWorld, notice?: Notice): void => {
  const at = world.now ?? 0;
  world.now = at;
  world.steps = [...(world.steps ?? []), notice === undefined ? { at } : { at, notice }];
};

const readAt = ({ steps = [], now = 0 }: NoticeWorld): string | undefined => {
  const texts: (string | undefined)[] = [];
  const read: (string | undefined)[] = [];
  const scheduler = new TestScheduler(() => undefined);
  scheduler.run(() => {
    const notices = new Subject<Notice>();
    const acted = new Subject<void>();
    showNotice({ told: notices, acted }).subscribe((notice) => {
      texts.push(notice?.text);
    });
    steps.map(({ at, notice }) => scheduler.schedule(() => (notice === undefined ? acted.next() : notices.next(notice)), at));
    scheduler.schedule(() => {
      read.push(texts.at(-1));
    }, now);
  });
  return read.at(-1);
};

Given('the app tells {string}', function theAppTells(this: NoticeWorld, text: string) {
  told(this, { text });
});

Given(
  'the app tells {string}, with the action {string}',
  function theAppTellsWithAnAction(this: NoticeWorld, text: string, label: string) {
    told(this, { text, action: { label, run: (): void => undefined } });
  }
);

When('{int} seconds pass', function secondsPass(this: NoticeWorld, seconds: number) {
  this.now = (this.now ?? 0) + seconds * SECOND;
});

When('the visitor takes the action of the notice', function theVisitorTakesTheAction(this: NoticeWorld) {
  told(this);
});

Then('the visitor reads {string}', function theVisitorReads(this: NoticeWorld, text: string) {
  assert.equal(readAt(this), text);
});

Then('the visitor reads no notice', function theVisitorReadsNoNotice(this: NoticeWorld) {
  assert.equal(readAt(this), undefined);
});
