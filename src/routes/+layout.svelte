<script lang="ts">
  import { of } from 'rxjs';
  import ThemeSwitcher from '#features/appearance/abilities/choose-theme/ui/components/theme-switcher.svelte';
  import { suggestLanguage } from '#features/languages/abilities/suggest-language/domain/suggest-language';
  import { localDismissal } from '#features/languages/abilities/suggest-language/implementation/browser/local-dismissal';
  import { browserPreferredLanguages } from '#features/languages/abilities/suggest-language/implementation/browser/preferred-languages';
  import LanguageSuggestion from '#features/languages/abilities/suggest-language/ui/components/language-suggestion.svelte';
  import { m } from '#i18n/messages';
  import { getLocale, type Locale, locales, localizeHref } from '#i18n/runtime';
  import { browser } from '$app/env';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import type { LayoutProps } from './$types';

  const { children, data }: LayoutProps = $props();

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

<div class="above-map">
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
</div>

<main>
  {@render children()}
</main>

<footer>
  <a href={localizeHref(resolve('/privacy'))}>{m.privacy_title()}</a>
  <ThemeSwitcher choice={data.theme.choice} onChoose={data.theme.choose} />
</footer>

<style>
  .above-map {
    position: relative;
    z-index: 1;
  }

  nav,
  footer {
    inline-size: fit-content;
    background: Canvas;
  }

  footer {
    position: fixed;
    inset-block-end: 0;
    inset-inline-start: 0;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;
    align-items: center;
    padding: 0.25rem 0.5rem;
  }

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
