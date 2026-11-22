import { defer, firstValueFrom, map, shareReplay } from 'rxjs';

type FetchFile = (url: string) => Promise<Response>;

const answered = (response: Response): Response => {
  if (!response.ok) {
    throw new Error(`The file answered ${response.status}.`);
  }
  return response;
};

const fetchedOnce = (fetchFile: FetchFile, url: string): (() => Promise<Response>) => {
  const answer$ = defer(() => fetchFile(url)).pipe(map(answered), shareReplay(1));
  return async () => (await firstValueFrom(answer$)).clone();
};

export { fetchedOnce };
