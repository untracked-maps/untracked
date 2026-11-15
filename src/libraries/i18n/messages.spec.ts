import { describe, expect, it } from 'vitest';
import en from '../../../messages/en.json' with { type: 'json' };
import fr from '../../../messages/fr.json' with { type: 'json' };
import settings from '../../../project.inlang/settings.json' with { type: 'json' };

const MESSAGES: Readonly<Record<string, object>> = { en, fr };

const alphabetically = (left: string, right: string): number => left.localeCompare(right);

const keysOf = (messages: object | undefined): readonly string[] => Object.keys(messages ?? {}).toSorted(alphabetically);

describe('translations', () => {
  it('provide a messages file for every locale of the project', () => {
    expect(Object.keys(MESSAGES).toSorted(alphabetically)).toEqual(settings.locales.toSorted(alphabetically));
  });

  it.each(settings.locales)('translate every message of the base locale in %s', (locale) => {
    expect(keysOf(MESSAGES[locale])).toEqual(keysOf(MESSAGES[settings.baseLocale]));
  });
});
