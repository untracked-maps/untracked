import { catchError, concatMap, endWith, ignoreElements, type Observable, of } from 'rxjs';

type SharedLink = {
  readonly title: string;
  readonly url: string;
};

type Shared = 'shared' | 'cancelled' | 'copied' | 'not copied';

type ShareUrl = (link: SharedLink) => Observable<'shared' | 'cancelled'>;

type CopyText = (text: string) => Observable<unknown>;

type ShareLinkPorts = {
  readonly shareUrl?: ShareUrl | undefined;
  readonly copyText: CopyText;
};

const copied =
  (copyText: CopyText) =>
  (text: string): Observable<Shared> =>
    copyText(text).pipe(
      ignoreElements(),
      endWith<Shared>('copied'),
      catchError(() => of<Shared>('not copied'))
    );

const shared =
  ({ shareUrl, copyText }: ShareLinkPorts) =>
  (link: SharedLink): Observable<Shared> =>
    shareUrl === undefined ? copied(copyText)(link.url) : shareUrl(link).pipe(catchError(() => copied(copyText)(link.url)));

const shareLink =
  (ports: ShareLinkPorts) =>
  (links: Observable<SharedLink>): Observable<Shared> =>
    links.pipe(concatMap(shared(ports)));

export { type SharedLink, type ShareLinkPorts, type ShareUrl, shareLink };
