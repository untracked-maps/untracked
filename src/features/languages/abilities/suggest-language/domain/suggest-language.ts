import { combineLatest, distinctUntilChanged, map, type Observable } from 'rxjs';
import { suggestedLocale } from './suggested-locale';

export type PreferredLanguages = () => Observable<readonly string[]>;

export type Dismissed = () => Observable<boolean>;

export type SuggestLanguagePorts = {
  readonly preferredLanguages: PreferredLanguages;
  readonly dismissed: Dismissed;
};

export const suggestLanguage =
  ({ preferredLanguages, dismissed }: SuggestLanguagePorts) =>
  (available: readonly string[], current: string): Observable<string | undefined> =>
    combineLatest([preferredLanguages(), dismissed()]).pipe(
      map(([preferred, isDismissed]) => (isDismissed ? undefined : suggestedLocale(available, current, preferred))),
      distinctUntilChanged()
    );
