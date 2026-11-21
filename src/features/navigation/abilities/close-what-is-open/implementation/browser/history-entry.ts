import { defer, from, of } from 'rxjs';
import type { HistoryEntry } from '../../domain/close-what-is-open';

type PushEntry = () => Promise<void>;

const historyEntry = (pushEntry: PushEntry, history: Pick<History, 'back'>): HistoryEntry => ({
  add: () => defer(() => from(pushEntry())),
  leave: () => defer(() => of(history.back()))
});

export { historyEntry };
