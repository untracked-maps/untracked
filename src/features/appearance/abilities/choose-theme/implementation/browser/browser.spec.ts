import { elementAt, firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { localThemeChoice } from './local-theme-choice';
import { browserPreferredColourScheme } from './preferred-colour-scheme';

const storageHolding = (kept?: string): Pick<Storage, 'getItem' | 'setItem'> => {
  const values = new Map<string, string>(kept === undefined ? [] : [['untracked-maps.theme', kept]]);
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value): void => {
      values.set(key, value);
    }
  };
};

type FakeMediaQuery = EventTarget & { readonly matches: boolean };

type FakeDevice = {
  readonly prefersDark: FakeMediaQuery;
  readonly matchMedia: (query: string) => FakeMediaQuery;
};

const deviceThatPrefers = (scheme: 'light' | 'dark'): FakeDevice => {
  const prefersDark = Object.assign(new EventTarget(), { matches: scheme === 'dark' });
  const anyOtherQuery = Object.assign(new EventTarget(), { matches: true });
  return {
    prefersDark,
    matchMedia: (query) => (query === '(prefers-color-scheme: dark)' ? prefersDark : anyOtherQuery)
  };
};

const colourSchemeChange = (matches: boolean): Event => Object.assign(new Event('change'), { matches });

describe('browser preferred colour scheme', () => {
  it('is dark on a device that prefers dark', async () => {
    expect(await firstValueFrom(browserPreferredColourScheme(deviceThatPrefers('dark'))())).toBe('dark');
  });

  it('is light on a device that prefers light', async () => {
    expect(await firstValueFrom(browserPreferredColourScheme(deviceThatPrefers('light'))())).toBe('light');
  });

  it('follows the device when it switches to dark', async () => {
    const device = deviceThatPrefers('light');
    const next = firstValueFrom(browserPreferredColourScheme(device)().pipe(elementAt(1)));

    device.prefersDark.dispatchEvent(colourSchemeChange(true));

    expect(await next).toBe('dark');
  });
});

describe('local theme choice', () => {
  it('follows the system on a first visit', async () => {
    expect(await firstValueFrom(localThemeChoice(storageHolding()).chosenTheme())).toBe('system');
  });

  it('reads a choice kept by an earlier version of the site', async () => {
    const storage = storageHolding('dark');

    expect(await firstValueFrom(localThemeChoice(storage).chosenTheme())).toBe('dark');
  });

  it('follows the system when the kept choice is not a theme', async () => {
    const storage = storageHolding('sepia');

    expect(await firstValueFrom(localThemeChoice(storage).chosenTheme())).toBe('system');
  });

  it('is the theme the visitor just chose', async () => {
    const choice = localThemeChoice(storageHolding());

    choice.choose('light');

    expect(await firstValueFrom(choice.chosenTheme())).toBe('light');
  });

  it('keeps the chosen theme for a later visit', async () => {
    const storage = storageHolding();
    localThemeChoice(storage).choose('dark');

    expect(await firstValueFrom(localThemeChoice(storage).chosenTheme())).toBe('dark');
  });
});
