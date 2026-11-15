import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { firstValueFrom, of } from 'rxjs';
import { suggestLanguage } from './domain/suggest-language';

const OFFERED_LOCALES: readonly string[] = ['en', 'fr'];

type SuggestionWorld = World & {
  preferred: readonly string[];
  dismissed: boolean;
  suggestion: string | undefined;
};

Given('a browser that prefers {string}', function aBrowserThatPrefers(this: SuggestionWorld, languages: string) {
  this.preferred = languages.split(',').map((language) => language.trim());
  this.dismissed = false;
});

Given('the visitor dismissed the language suggestion', function theVisitorDismissedTheSuggestion(this: SuggestionWorld) {
  this.dismissed = true;
});

When('the visitor opens the page in {string}', async function theVisitorOpensThePageIn(this: SuggestionWorld, locale: string) {
  this.suggestion = await firstValueFrom(
    suggestLanguage({ preferredLanguages: () => of(this.preferred), dismissed: () => of(this.dismissed) })(
      OFFERED_LOCALES,
      locale
    )
  );
});

Then('the site suggests {string}', function theSiteSuggests(this: SuggestionWorld, locale: string) {
  assert.equal(this.suggestion, locale);
});

Then('the site suggests nothing', function theSiteSuggestsNothing(this: SuggestionWorld) {
  assert.equal(this.suggestion, undefined);
});
