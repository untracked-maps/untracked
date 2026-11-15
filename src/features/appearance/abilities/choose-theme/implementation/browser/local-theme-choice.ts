import { BehaviorSubject } from 'rxjs';
import { type ChosenTheme, THEME_CHOICES, type ThemeChoice } from '../../domain/choose-theme';

type ThemeChoiceOnDevice = {
  readonly chosenTheme: ChosenTheme;
  readonly choose: (choice: ThemeChoice) => void;
};

const THEME_KEY = 'untracked-maps.theme';

const storedChoice = (stored: string | null): ThemeChoice => THEME_CHOICES.find((choice) => choice === stored) ?? 'system';

const localThemeChoice = (storage: Pick<Storage, 'getItem' | 'setItem'>): ThemeChoiceOnDevice => {
  const chosen$ = new BehaviorSubject(storedChoice(storage.getItem(THEME_KEY)));
  return {
    chosenTheme: () => chosen$.asObservable(),
    choose: (choice: ThemeChoice): void => {
      storage.setItem(THEME_KEY, choice);
      chosen$.next(choice);
    }
  };
};

export { localThemeChoice };
