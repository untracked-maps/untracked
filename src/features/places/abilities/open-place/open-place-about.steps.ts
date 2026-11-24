import assert from 'node:assert/strict';
import { Then, type World } from '@cucumber/cucumber';
import { expectsHours } from './domain/expects-hours';
import type { PlaceSheet, SheetPlace } from './domain/open-place';
import { localNameOf, textOf } from './domain/place-text';
import { preciseTypeOf } from './domain/precise-type';

type AboutWorld = World & {
  sheet: PlaceSheet;
};

const opened = (world: AboutWorld): SheetPlace | undefined => (world.sheet.status === 'open' ? world.sheet.place : undefined);

const localName = (world: AboutWorld): string | undefined => {
  const place = opened(world);
  return place === undefined ? undefined : localNameOf(place);
};

Then('its precise type is {string}', function itsPreciseTypeIs(this: AboutWorld, type: string) {
  assert.equal(preciseTypeOf(opened(this)?.tags), type);
});

Then('it has no precise type', function itHasNoPreciseType(this: AboutWorld) {
  assert.equal(preciseTypeOf(opened(this)?.tags), undefined);
});

Then('its local name is {string}', function itsLocalNameIs(this: AboutWorld, name: string) {
  assert.equal(localName(this), name);
});

Then('it has no local name', function itHasNoLocalName(this: AboutWorld) {
  assert.equal(localName(this), undefined);
});

Then('its text in {string} is {string}', function itsTextIs(this: AboutWorld, locale: string, text: string) {
  assert.equal(textOf(opened(this)?.tags, locale)?.text, text);
});

Then('it has no text in {string}', function itHasNoText(this: AboutWorld, locale: string) {
  assert.equal(textOf(opened(this)?.tags, locale), undefined);
});

Then('its text in {string} shows whole', function itsTextShowsWhole(this: AboutWorld, locale: string) {
  assert.equal(textOf(opened(this)?.tags, locale)?.long, false);
});

Then('its text in {string} is cut', function itsTextIsCut(this: AboutWorld, locale: string) {
  assert.equal(textOf(opened(this)?.tags, locale)?.long, true);
});

Then('its text comes last', function itsTextComesLast(this: AboutWorld) {
  assert.equal(expectsHours(opened(this)?.kind), true);
});

Then('its text comes first', function itsTextComesFirst(this: AboutWorld) {
  assert.equal(expectsHours(opened(this)?.kind), false);
});
