const REGION_SUBTAG = /-.*/u;

const languageOf = (tag: string): string => tag.toLowerCase().replace(REGION_SUBTAG, '');

export const suggestedLocale = (
  available: readonly string[],
  current: string,
  preferred: readonly string[]
): string | undefined => {
  const firstOffered = preferred.map(languageOf).find((language) => available.includes(language));
  return firstOffered === current ? undefined : firstOffered;
};
