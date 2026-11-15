import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { BehaviorSubject } from 'rxjs';
import { type ColourScheme, chooseTheme, THEME_CHOICES, type ThemeChoice } from './domain/choose-theme';

type ThemeWorld = World & {
  device: BehaviorSubject<ColourScheme>;
  keptChoice: ThemeChoice;
  choice: BehaviorSubject<ThemeChoice>;
  shown: ColourScheme;
};

const colourScheme = (name: string): ColourScheme => (name === 'dark' ? 'dark' : 'light');

const themeChoice = (name: string): ThemeChoice => THEME_CHOICES.find((choice) => choice === name) ?? 'system';

Given('a device that prefers the {string} colour scheme', function aDeviceThatPrefers(this: ThemeWorld, scheme: string) {
  this.device = new BehaviorSubject(colourScheme(scheme));
  this.keptChoice = 'system';
});

Given(
  'the visitor chose the {string} theme on an earlier visit',
  function theVisitorChoseEarlier(this: ThemeWorld, choice: string) {
    this.keptChoice = themeChoice(choice);
  }
);

When('the visitor opens the site', function theVisitorOpensTheSite(this: ThemeWorld) {
  this.choice = new BehaviorSubject(this.keptChoice);
  chooseTheme({
    chosenTheme: () => this.choice.asObservable(),
    preferredColourScheme: () => this.device.asObservable()
  })().subscribe((scheme) => {
    this.shown = scheme;
  });
});

When('the visitor chooses the {string} theme', function theVisitorChooses(this: ThemeWorld, choice: string) {
  this.choice.next(themeChoice(choice));
});

When('the device switches to the {string} colour scheme', function theDeviceSwitches(this: ThemeWorld, scheme: string) {
  this.device.next(colourScheme(scheme));
});

Then('the site is shown in the {string} colour scheme', function theSiteIsShownIn(this: ThemeWorld, scheme: string) {
  assert.equal(this.shown, scheme);
});
