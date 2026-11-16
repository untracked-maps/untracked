import { NEVER, type Observable, of } from 'rxjs';
import { THEME_STORAGE_KEY } from '#configuration/theme';
import {
  type ColourScheme,
  chooseTheme,
  type ThemeChoice
} from '#features/appearance/abilities/choose-theme/domain/choose-theme';
import { localThemeChoice } from '#features/appearance/abilities/choose-theme/implementation/browser/local-theme-choice';
import { browserPreferredColourScheme } from '#features/appearance/abilities/choose-theme/implementation/browser/preferred-colour-scheme';
import { suggestLanguage } from '#features/languages/abilities/suggest-language/domain/suggest-language';
import { localDismissal } from '#features/languages/abilities/suggest-language/implementation/browser/local-dismissal';
import { browserPreferredLanguages } from '#features/languages/abilities/suggest-language/implementation/browser/preferred-languages';
import { getLocale, locales } from '#i18n/runtime';
import { browser } from '$app/env';
import type { LayoutLoad } from './$types';

type Theme = {
  readonly choice: Observable<ThemeChoice>;
  readonly choose: (choice: ThemeChoice) => void;
  readonly colourScheme: Observable<ColourScheme>;
};

const themeOnThisDevice = (): Theme => {
  const themeChoice = localThemeChoice(localStorage, THEME_STORAGE_KEY);
  return {
    choice: themeChoice.chosenTheme(),
    choose: themeChoice.choose,
    colourScheme: chooseTheme({
      chosenTheme: themeChoice.chosenTheme,
      preferredColourScheme: browserPreferredColourScheme(globalThis)
    })()
  };
};

type LanguageSuggestion = {
  readonly suggestion: Observable<string | undefined>;
  readonly dismiss: () => void;
};

const languageSuggestionOnThisDevice = (): LanguageSuggestion => {
  const dismissal = localDismissal(localStorage);
  return {
    suggestion: suggestLanguage({ preferredLanguages: browserPreferredLanguages(navigator), dismissed: dismissal.dismissed })(
      locales,
      getLocale()
    ),
    dismiss: dismissal.dismiss
  };
};

const languageSuggestionWhilePrerendering: LanguageSuggestion = { suggestion: of(undefined), dismiss: () => undefined };

const themeWhilePrerendering: Theme = { choice: of('system'), choose: () => undefined, colourScheme: NEVER };

export const prerender = true;

export const load: LayoutLoad = (): { readonly theme: Theme; readonly languageSuggestion: LanguageSuggestion } => ({
  theme: browser ? themeOnThisDevice() : themeWhilePrerendering,
  languageSuggestion: browser ? languageSuggestionOnThisDevice() : languageSuggestionWhilePrerendering
});
