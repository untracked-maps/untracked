import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { type Observable, of, Subject, type Subscription, throwError } from 'rxjs';
import { fakeParis } from '#libraries/fake-paris/fake-paris';
import { type RecentPlace, type RecentPlaces, recentSearches } from './domain/recent-searches';

type Visit = {
  readonly chosen: Subject<RecentPlace>;
  readonly cleared: Subject<void>;
  readonly subscription: Subscription;
};

type RecentSearchesWorld = World & {
  kept: RecentPlaces;
  refusing: boolean;
  shown: RecentPlaces;
  visit: Visit | undefined;
};

const placeNamed = (name: string): RecentPlace => {
  const place = fakeParis().find((candidate) => candidate.name === name);
  assert.ok(place, `No place of the fake Paris is named ${name}.`);
  return place;
};

const placesNamed = (names: string): RecentPlaces => names.split(', ').map(placeNamed);

const storeOn =
  (world: RecentSearchesWorld) =>
  (recents: RecentPlaces): Observable<void> => {
    if (world.refusing) {
      return throwError(() => new Error('The storage is full.'));
    }
    world.kept = recents;
    return of(undefined);
  };

const visitOf = (world: RecentSearchesWorld): Visit => {
  const chosen = new Subject<RecentPlace>();
  const cleared = new Subject<void>();
  const subscription = recentSearches({ storedRecents: () => of(world.kept), storeRecents: storeOn(world) })({
    chosen,
    cleared
  }).subscribe((recents) => {
    world.shown = recents;
  });
  return { chosen, cleared, subscription };
};

const visiting = (world: RecentSearchesWorld): Visit => {
  world.visit ??= visitOf(world);
  return world.visit;
};

Given('no recent search on this device', function noRecentSearch(this: RecentSearchesWorld) {
  this.kept = [];
  this.refusing = false;
});

Given('the recent searches {string} on this device', function theRecentSearchesOn(this: RecentSearchesWorld, names: string) {
  this.kept = placesNamed(names);
  this.refusing = false;
});

Given('a device that cannot keep recent searches', function aDeviceThatCannotKeep(this: RecentSearchesWorld) {
  this.kept = [];
  this.refusing = true;
});

When('the visitor chooses {string}', function theVisitorChooses(this: RecentSearchesWorld, name: string) {
  visiting(this).chosen.next(placeNamed(name));
});

When('the visitor clears the recent searches', function theVisitorClears(this: RecentSearchesWorld) {
  visiting(this).cleared.next();
});

When('the visitor comes back later', function theVisitorComesBack(this: RecentSearchesWorld) {
  visiting(this).subscription.unsubscribe();
  this.visit = visitOf(this);
});

Then('the recent searches are {string}', function theRecentSearchesAre(this: RecentSearchesWorld, names: string) {
  assert.deepEqual(
    this.shown.map(({ name }) => name),
    names.split(', ')
  );
});

Then('there is no recent search', function thereIsNoRecentSearch(this: RecentSearchesWorld) {
  assert.deepEqual(this.shown, []);
});
