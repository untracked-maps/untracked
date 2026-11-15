import { BehaviorSubject } from 'rxjs';
import type { Dismissed } from '../../domain/suggest-language';

const DISMISSED_KEY = 'untracked-maps.language-suggestion.dismissed';

export type Dismissal = {
  readonly dismissed: Dismissed;
  readonly dismiss: () => void;
};

export const localDismissal = (storage: Pick<Storage, 'getItem' | 'setItem'>): Dismissal => {
  const dismissed$ = new BehaviorSubject(storage.getItem(DISMISSED_KEY) === 'true');
  return {
    dismissed: () => dismissed$.asObservable(),
    dismiss: (): void => {
      storage.setItem(DISMISSED_KEY, 'true');
      dismissed$.next(true);
    }
  };
};
