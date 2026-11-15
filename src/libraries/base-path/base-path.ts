type Locales = {
  readonly baseLocale: string;
  readonly locales: readonly string[];
};

type LocaleUrlPattern = {
  pattern: string;
  localized: [string, string][];
};

const SURROUNDING_SLASHES = /^\/|\/$/gu;

const segmentOf = (basePath: string): string => basePath.replace(SURROUNDING_SLASHES, '');

const kitBasePath = (basePath: string): '' | `/${string}` => {
  const segment = segmentOf(basePath);
  return segment === '' ? '' : `/${segment}`;
};

const patternsUnder = (segment: string, { baseLocale, locales }: Locales): LocaleUrlPattern[] => {
  const base = `/{${segment}/}?`;
  return [
    {
      pattern: `${base}:path(.*)?`,
      localized: [
        ...locales
          .filter((locale) => locale !== baseLocale)
          .map((locale): [string, string] => [locale, `${base}${locale}/:path(.*)?`]),
        [baseLocale, `${base}:path(.*)?`]
      ]
    }
  ];
};

const localeUrlPatterns = (basePath: string, locales: Locales): LocaleUrlPattern[] | undefined => {
  const segment = segmentOf(basePath);
  return segment === '' ? undefined : patternsUnder(segment, locales);
};

export { kitBasePath, type Locales, localeUrlPatterns };
