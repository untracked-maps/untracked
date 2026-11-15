<script lang="ts">
  import { of } from 'rxjs';
  import { suggestLanguage } from '#features/languages/abilities/suggest-language/domain/suggest-language';
  import { localDismissal } from '#features/languages/abilities/suggest-language/implementation/browser/local-dismissal';
  import { browserPreferredLanguages } from '#features/languages/abilities/suggest-language/implementation/browser/preferred-languages';
  import LanguageSuggestion from '#features/languages/abilities/suggest-language/ui/components/language-suggestion.svelte';
  import { m } from '#i18n/messages';
  import { getLocale, type Locale, locales, localizeHref } from '#i18n/runtime';
  import { browser } from '$app/env';
  import { page } from '$app/state';
  import type { LayoutProps } from './$types';

  const { children }: LayoutProps = $props();

  const hrefFor = (locale: Locale): string => localizeHref(page.url.pathname, { locale });

  const dismissal = browser ? localDismissal(localStorage) : undefined;

  const suggestion =
    dismissal === undefined
      ? of(undefined)
      : suggestLanguage({ preferredLanguages: browserPreferredLanguages(navigator), dismissed: dismissal.dismissed })(
          locales,
          getLocale()
        );

  const dismiss = (): void => dismissal?.dismiss();
</script>

<svelte:head>
  <title>{m.app_name()}</title>
  <meta name="description" content={m.app_description()} />
</svelte:head>

<LanguageSuggestion {suggestion} {hrefFor} onDismiss={dismiss} />

<nav aria-label={m.language_switcher_label()}>
  <ul>
    {#each locales as locale (locale)}
      <li>
        <a
          href={hrefFor(locale)}
          hreflang={locale}
          lang={locale}
          aria-current={locale === getLocale() ? 'page' : undefined}
          data-sveltekit-reload
        >
          {m.language_name({}, { locale })}
        </a>
      </li>
    {/each}
  </ul>
</nav>

<main>
  {@render children()}
</main>

<style>
  nav ul {
    display: flex;
    gap: 0.5rem;
    padding: 0;
    list-style: none;
  }

  nav a {
    display: inline-block;
    min-inline-size: 24px;
    min-block-size: 24px;
    padding: 0.25rem 0.5rem;
  }
</style>
