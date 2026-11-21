import { BehaviorSubject, filter, NEVER, type Observable, of, Subject, share } from 'rxjs';
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
import {
  type Closable,
  closeWhatIsOpen,
  type Report
} from '#features/navigation/abilities/close-what-is-open/domain/close-what-is-open';
import { escapePresses } from '#features/navigation/abilities/close-what-is-open/implementation/browser/escape-presses';
import { historyEntry } from '#features/navigation/abilities/close-what-is-open/implementation/browser/history-entry';
import { historySteps } from '#features/navigation/abilities/close-what-is-open/implementation/browser/history-steps';
import { getLocale, locales } from '#i18n/runtime';
import { type Closable as ClosableElement, NEVER_ASKED } from '#libraries/design/closable';
import { browser } from '$app/env';
import { goto } from '$app/navigation';
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

type BottomSheets = {
  readonly height: Observable<number>;
  readonly show: (height: number) => void;
};

const bottomSheets = (): BottomSheets => {
  const heights = new BehaviorSubject(0);
  return { height: heights, show: (height) => heights.next(height) };
};

type Closing = {
  readonly of: (element: Closable) => ClosableElement;
  readonly closings: Observable<Closable>;
  readonly steps: Observable<unknown>;
};

const addHistoryEntry = (): Promise<void> => goto(location.href, { shallow: true });

const closingInThisBrowser = (): Closing => {
  const reports = new Subject<Report>();
  const steps = historySteps(globalThis).pipe(share());
  const closings = closeWhatIsOpen({ entry: historyEntry(addHistoryEntry, history) })({
    reports,
    escapes: escapePresses(globalThis),
    steps
  }).pipe(share());
  return {
    of: (element) => ({
      onToggle: (open) => reports.next({ element, open }),
      closings: closings.pipe(filter((closing) => closing === element))
    }),
    closings,
    steps
  };
};

const closingWhilePrerendering: Closing = {
  of: () => NEVER_ASKED,
  closings: NEVER,
  steps: NEVER
};

export const prerender = true;

export const load: LayoutLoad = (): {
  readonly theme: Theme;
  readonly languageSuggestion: LanguageSuggestion;
  readonly sheets: BottomSheets;
  readonly closing: Closing;
} => ({
  closing: browser ? closingInThisBrowser() : closingWhilePrerendering,
  sheets: bottomSheets(),
  theme: browser ? themeOnThisDevice() : themeWhilePrerendering,
  languageSuggestion: browser ? languageSuggestionOnThisDevice() : languageSuggestionWhilePrerendering
});
