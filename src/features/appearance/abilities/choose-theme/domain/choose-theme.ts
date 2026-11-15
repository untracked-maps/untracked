import { combineLatest, distinctUntilChanged, map, type Observable } from 'rxjs';

type ColourScheme = 'light' | 'dark';

type ThemeChoice = ColourScheme | 'system';

type ChosenTheme = () => Observable<ThemeChoice>;

type PreferredColourScheme = () => Observable<ColourScheme>;

type ChooseThemePorts = {
  readonly chosenTheme: ChosenTheme;
  readonly preferredColourScheme: PreferredColourScheme;
};

const THEME_CHOICES: readonly ThemeChoice[] = ['light', 'dark', 'system'];

const displayedScheme = (choice: ThemeChoice, preferred: ColourScheme): ColourScheme =>
  choice === 'system' ? preferred : choice;

const chooseTheme =
  ({ chosenTheme, preferredColourScheme }: ChooseThemePorts) =>
  (): Observable<ColourScheme> =>
    combineLatest([chosenTheme(), preferredColourScheme()]).pipe(
      map(([choice, preferred]) => displayedScheme(choice, preferred)),
      distinctUntilChanged()
    );

export { type ChosenTheme, type ColourScheme, chooseTheme, type PreferredColourScheme, THEME_CHOICES, type ThemeChoice };
