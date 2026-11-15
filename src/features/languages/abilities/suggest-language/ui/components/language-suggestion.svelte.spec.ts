import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { suggestLanguage } from '../../domain/suggest-language';
import { localDismissal } from '../../implementation/browser/local-dismissal';
import { browserPreferredLanguages } from '../../implementation/browser/preferred-languages';
import LanguageSuggestion from './language-suggestion.svelte';

const hrefFor = (locale: string): string => `/${locale}`;

const memoryStorage = (): Pick<Storage, 'getItem' | 'setItem'> => {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value): void => {
      values.set(key, value);
    }
  };
};

describe('language suggestion', () => {
  it('suggests the page in the suggested language, written in that language', async () => {
    await render(LanguageSuggestion, { suggestion: of('fr'), hrefFor, onDismiss: () => undefined });

    await expect.element(page.getByRole('link', { name: 'La lire en français' })).toHaveAttribute('href', '/fr');
  });

  it('says in the suggested language that the page exists in it', async () => {
    await render(LanguageSuggestion, { suggestion: of('fr'), hrefFor, onDismiss: () => undefined });

    await expect.element(page.getByText('Cette page existe en français.')).toBeVisible();
  });

  it('names the banner in the suggested language', async () => {
    await render(LanguageSuggestion, { suggestion: of('fr'), hrefFor, onDismiss: () => undefined });

    await expect.element(page.getByRole('complementary', { name: 'Suggestion de langue' })).toBeVisible();
  });

  it('marks the banner with the suggested language', async () => {
    await render(LanguageSuggestion, { suggestion: of('fr'), hrefFor, onDismiss: () => undefined });

    await expect.element(page.getByRole('complementary')).toHaveAttribute('lang', 'fr');
  });

  it('shows nothing when there is nothing to suggest', async () => {
    await render(LanguageSuggestion, { suggestion: of(undefined), hrefFor, onDismiss: () => undefined });

    await expect.element(page.getByRole('complementary')).not.toBeInTheDocument();
  });

  it('disappears once dismissed', async () => {
    const dismissal = localDismissal(memoryStorage());
    const suggestion = suggestLanguage({
      preferredLanguages: browserPreferredLanguages({ languages: ['fr-FR'] }),
      dismissed: dismissal.dismissed
    })(['en', 'fr'], 'en');
    await render(LanguageSuggestion, { suggestion, hrefFor, onDismiss: dismissal.dismiss });

    await page.getByRole('button', { name: 'Fermer' }).click();

    await expect.element(page.getByRole('complementary')).not.toBeInTheDocument();
  });
});
