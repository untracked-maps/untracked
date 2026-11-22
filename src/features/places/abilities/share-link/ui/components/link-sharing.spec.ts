import { type Observable, of, throwError } from 'rxjs';
import { describe, expect, it } from 'vitest';
import type { ShareLinkPorts } from '../../domain/share-link';
import { linkSharing } from './link-sharing';

const LINK = { title: 'Café de Flore', url: 'https://example.org/#map=17/48.85/2.33&place=flore' };

const refused = (): Observable<never> => throwError(() => new Error('Refused.'));

const toldWith = (ports: ShareLinkPorts): readonly string[] => {
  const told: string[] = [];
  linkSharing(ports, ({ text }) => {
    told.push(text);
  })(LINK);
  return told;
};

describe('sharing a link', () => {
  it('tells the visitor when the link could not be copied', () => {
    expect(toldWith({ copyText: refused })).toEqual(['The link could not be copied']);
  });

  it('tells nothing once the link is copied', () => {
    expect(toldWith({ copyText: () => of(undefined) })).toEqual([]);
  });

  it('tells nothing once the link is shared', () => {
    expect(toldWith({ shareUrl: () => of('shared' as const), copyText: refused })).toEqual([]);
  });

  it('tells nothing when the share is cancelled', () => {
    expect(toldWith({ shareUrl: () => of('cancelled' as const), copyText: refused })).toEqual([]);
  });
});
