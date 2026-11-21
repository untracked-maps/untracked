import { defer, type Observable } from 'rxjs';
import type { CopyText } from '../../domain/open-place';

type Clipboard = {
  readonly writeText: (text: string) => Promise<void>;
};

const noClipboard = (): Promise<void> => Promise.reject(new Error('This browser offers no clipboard.'));

const clipboardCopy =
  (clipboard: Clipboard | undefined): CopyText =>
  (text: string): Observable<void> =>
    defer(() => (clipboard === undefined ? noClipboard() : clipboard.writeText(text)));

export { clipboardCopy };
