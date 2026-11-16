import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { BehaviorSubject, firstValueFrom, type Observable } from 'rxjs';
import { welcomeVisitor } from './domain/welcome-visitor';

type WelcomeWorld = World & {
  acknowledged: BehaviorSubject<boolean>;
  welcome: Observable<boolean>;
};

Given('a visitor who never acknowledged the welcome', function aFirstTimeVisitor(this: WelcomeWorld) {
  this.acknowledged = new BehaviorSubject(false);
});

Given('a visitor who acknowledged the welcome before', function aReturningVisitor(this: WelcomeWorld) {
  this.acknowledged = new BehaviorSubject(true);
});

When('the visitor comes to the site', function theVisitorComesToTheSite(this: WelcomeWorld) {
  this.welcome = welcomeVisitor({ acknowledged: () => this.acknowledged.asObservable() })();
});

When('the visitor acknowledges the welcome', function theVisitorAcknowledges(this: WelcomeWorld) {
  this.acknowledged.next(true);
});

Then('the site welcomes the visitor', async function theSiteWelcomes(this: WelcomeWorld) {
  assert.equal(await firstValueFrom(this.welcome), true);
});

Then('the site no longer welcomes the visitor', async function theSiteNoLongerWelcomes(this: WelcomeWorld) {
  assert.equal(await firstValueFrom(this.welcome), false);
});
