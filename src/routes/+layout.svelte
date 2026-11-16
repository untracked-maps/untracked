<script lang="ts">
  import { of } from 'rxjs';
  import ThemeSwitcher from '#features/appearance/abilities/choose-theme/ui/components/theme-switcher.svelte';
  import { suggestLanguage } from '#features/languages/abilities/suggest-language/domain/suggest-language';
  import { localDismissal } from '#features/languages/abilities/suggest-language/implementation/browser/local-dismissal';
  import { browserPreferredLanguages } from '#features/languages/abilities/suggest-language/implementation/browser/preferred-languages';
  import LanguageSuggestion from '#features/languages/abilities/suggest-language/ui/components/language-suggestion.svelte';
  import { m } from '#i18n/messages';
  import { getLocale, type Locale, locales, localizeHref } from '#i18n/runtime';
  import AppFrame from '#libraries/design/app-frame.svelte';
  import Floating from '#libraries/design/floating.svelte';
  import '#libraries/design/global.css';
  import LockIcon from '#libraries/design/lock-icon.svelte';
  import SegmentedLinks from '#libraries/design/segmented-links.svelte';
  import { browser } from '$app/env';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import type { LayoutProps } from './$types';

  const { children, data }: LayoutProps = $props();

  const hrefFor = (locale: Locale): string => localizeHref(page.url.pathname, { locale });

  const languageLinks = $derived(
    locales.map((locale) => ({
      href: hrefFor(locale),
      lang: locale,
      text: m.language_name({}, { locale }),
      current: locale === getLocale()
    }))
  );

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

<AppFrame>
  {#snippet top()}
    <SegmentedLinks label={m.language_switcher_label()} links={languageLinks} reload />
    <LanguageSuggestion {suggestion} {hrefFor} onDismiss={dismiss} />
  {/snippet}

  {@render children()}

  {#snippet bottom()}
    <Floating>
      <div class="settings">
        <a class="privacy" href={localizeHref(resolve('/privacy'))}><LockIcon />{m.privacy_title()}</a>
        <ThemeSwitcher choice={data.theme.choice} onChoose={data.theme.choose} />
      </div>
    </Floating>
  {/snippet}
</AppFrame>

<style>
  .settings {
    display: flex;
    flex-wrap: wrap-reverse;
    gap: var(--space-2) var(--space-4);
    align-items: center;
  }

  .privacy {
    display: inline-flex;
    gap: var(--space-2);
    align-items: center;
    min-block-size: 1.5rem;
    font-size: var(--font-size-meta);
    font-weight: var(--font-weight-strong);
    text-decoration: none;
  }
</style>
