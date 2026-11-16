import { BehaviorSubject } from 'rxjs';
import type { Acknowledged } from '../../domain/welcome-visitor';

export type Acknowledgement = {
  readonly acknowledged: Acknowledged;
  readonly acknowledge: () => void;
};

export const localAcknowledgement = (storage: Pick<Storage, 'getItem' | 'setItem'>, key: string): Acknowledgement => {
  const acknowledged$ = new BehaviorSubject(storage.getItem(key) === 'true');
  return {
    acknowledged: () => acknowledged$.asObservable(),
    acknowledge: (): void => {
      storage.setItem(key, 'true');
      acknowledged$.next(true);
    }
  };
};
