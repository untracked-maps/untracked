import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { ThemeChoice } from '../../domain/choose-theme';
import { localThemeChoice } from '../../implementation/browser/local-theme-choice';
import ThemeSwitcher from './theme-switcher.svelte';

describe('theme switcher', () => {
  it('groups the themes under a label', async () => {
    await render(ThemeSwitcher, { choice: of<ThemeChoice>('system'), onChoose: () => undefined });

    await expect.element(page.getByRole('group', { name: 'Theme' })).toBeVisible();
  });

  it('checks the chosen theme', async () => {
    await render(ThemeSwitcher, { choice: of<ThemeChoice>('dark'), onChoose: () => undefined });

    await expect.element(page.getByRole('radio', { name: 'Dark' })).toBeChecked();
  });

  it('leaves the other themes unchecked', async () => {
    await render(ThemeSwitcher, { choice: of<ThemeChoice>('dark'), onChoose: () => undefined });

    await expect.element(page.getByRole('radio', { name: 'System' })).not.toBeChecked();
  });

  it('marks the document with the chosen theme', async () => {
    await render(ThemeSwitcher, { choice: of<ThemeChoice>('light'), onChoose: () => undefined });

    await expect.poll(() => document.documentElement.dataset['theme']).toBe('light');
  });

  it('shows the document in the dark colour scheme once the visitor chooses the dark theme', async () => {
    const themeChoice = localThemeChoice(sessionStorage, 'theme');
    await render(ThemeSwitcher, { choice: themeChoice.chosenTheme(), onChoose: themeChoice.choose });

    await page.getByRole('radio', { name: 'Dark' }).click();

    await expect.poll(() => getComputedStyle(document.documentElement).colorScheme).toBe('dark');
  });
});
