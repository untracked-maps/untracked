import { map, type Observable, shareReplay, timer } from 'rxjs';

const SECOND = 1000;

const clock = (now: () => number): Observable<number> =>
  timer(0, SECOND).pipe(
    map(() => now()),
    shareReplay({ bufferSize: 1, refCount: true })
  );

export { clock };
