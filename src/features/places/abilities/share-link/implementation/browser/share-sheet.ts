import { catchError, defer, map, type Observable, of, throwError } from 'rxjs';
import type { SharedLink, ShareUrl } from '../../domain/share-link';

type Device = {
  readonly share?: (data: ShareData) => Promise<void>;
};

const isCancelled = (error: unknown): boolean => error instanceof DOMException && error.name === 'AbortError';

const answerOf = (error: unknown): Observable<'cancelled'> => (isCancelled(error) ? of('cancelled') : throwError(() => error));

const shareSheet = (device: Device | undefined): ShareUrl | undefined => {
  const share = device?.share?.bind(device);
  return share === undefined
    ? undefined
    : ({ title, url }: SharedLink): Observable<'shared' | 'cancelled'> =>
        defer(() => share({ title, url })).pipe(
          map(() => 'shared' as const),
          catchError(answerOf)
        );
};

export { shareSheet };
