import { NEVER, type Observable, of } from 'rxjs';
import { THEME_STORAGE_KEY } from '#configuration/theme';
import {
  type ColourScheme,
  chooseTheme,
  type ThemeChoice
} from '#features/appearance/abilities/choose-theme/domain/choose-theme';
import { localThemeChoice } from '#features/appearance/abilities/choose-theme/implementation/browser/local-theme-choice';
import { browserPreferredColourScheme } from '#features/appearance/abilities/choose-theme/implementation/browser/preferred-colour-scheme';
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

const themeWhilePrerendering: Theme = { choice: of('system'), choose: () => undefined, colourScheme: NEVER };

export const prerender = true;

export const load: LayoutLoad = (): { readonly theme: Theme } => ({
  theme: browser ? themeOnThisDevice() : themeWhilePrerendering
});
