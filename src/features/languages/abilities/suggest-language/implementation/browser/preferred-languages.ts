import { type Observable, of } from 'rxjs';
import type { PreferredLanguages } from '../../domain/suggest-language';

export const browserPreferredLanguages =
  (navigator: { readonly languages: readonly string[] }): PreferredLanguages =>
  (): Observable<readonly string[]> =>
    of(navigator.languages);
