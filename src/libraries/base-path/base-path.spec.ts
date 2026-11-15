import { describe, expect, it } from 'vitest';
import { kitBasePath, localeUrlPatterns } from './base-path';

const LOCALES = { baseLocale: 'en', locales: ['en', 'fr'] };

describe('base path of SvelteKit', () => {
  it('is empty without a base path', () => {
    expect(kitBasePath('')).toBe('');
  });

  it('is the base path with a single leading slash', () => {
    expect(kitBasePath('untracked/')).toBe('/untracked');
  });

  it('keeps the inner slashes of a nested base path', () => {
    expect(kitBasePath('/maps/untracked/')).toBe('/maps/untracked');
  });

  it('keeps a base path given with its leading slash', () => {
    expect(kitBasePath('/untracked')).toBe('/untracked');
  });
});

describe('locale URL patterns', () => {
  it('are left to Paraglide without a base path', () => {
    expect(localeUrlPatterns('', LOCALES)).toBeUndefined();
  });

  it('accept addresses with or without the base path', () => {
    expect(localeUrlPatterns('/untracked', LOCALES)?.[0]?.pattern).toBe('/{untracked/}?:path(.*)?');
  });

  it('prefix every other locale after the base path, and leave the base locale unprefixed, last', () => {
    expect(localeUrlPatterns('/untracked', LOCALES)?.[0]?.localized).toEqual([
      ['fr', '/{untracked/}?fr/:path(.*)?'],
      ['en', '/{untracked/}?:path(.*)?']
    ]);
  });
});
