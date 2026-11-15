import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { localDismissal } from './local-dismissal';
import { browserPreferredLanguages } from './preferred-languages';

const fakeStorage = (entries: Readonly<Record<string, string>> = {}): Pick<Storage, 'getItem' | 'setItem'> => {
  const values = new Map(Object.entries(entries));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value): void => {
      values.set(key, value);
    }
  };
};

describe('browser preferred languages', () => {
  it('are the languages of the navigator', async () => {
    const preferred = browserPreferredLanguages({ languages: ['fr-FR', 'en'] });

    expect(await firstValueFrom(preferred())).toEqual(['fr-FR', 'en']);
  });
});

describe('local dismissal', () => {
  it('is not dismissed on a first visit', async () => {
    expect(await firstValueFrom(localDismissal(fakeStorage()).dismissed())).toBe(false);
  });

  it('reads a dismissal kept by an earlier version of the site', async () => {
    const storage = fakeStorage({ 'untracked-maps.language-suggestion.dismissed': 'true' });

    expect(await firstValueFrom(localDismissal(storage).dismissed())).toBe(true);
  });

  it('is dismissed once the visitor dismissed it', async () => {
    const dismissal = localDismissal(fakeStorage());

    dismissal.dismiss();

    expect(await firstValueFrom(dismissal.dismissed())).toBe(true);
  });

  it('stays dismissed on a later visit', async () => {
    const storage = fakeStorage();
    localDismissal(storage).dismiss();

    expect(await firstValueFrom(localDismissal(storage).dismissed())).toBe(true);
  });
});
