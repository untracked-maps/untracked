import { fromEvent, map, type Observable, startWith } from 'rxjs';
import type { ColourScheme, PreferredColourScheme } from '../../domain/choose-theme';

const PREFERS_DARK = '(prefers-color-scheme: dark)';

type MediaQuery = EventTarget & { readonly matches: boolean };

type MediaQueryChange = Event & { readonly matches: boolean };

const schemeOf = (prefersDark: boolean): ColourScheme => (prefersDark ? 'dark' : 'light');

export const browserPreferredColourScheme =
  (window: { readonly matchMedia: (query: string) => MediaQuery }): PreferredColourScheme =>
  (): Observable<ColourScheme> => {
    const prefersDark = window.matchMedia(PREFERS_DARK);
    return fromEvent<MediaQueryChange>(prefersDark, 'change').pipe(
      map(({ matches }) => matches),
      startWith(prefersDark.matches),
      map(schemeOf)
    );
  };
