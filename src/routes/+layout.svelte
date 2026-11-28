<script lang="ts">
  import About from '#features/about/ui/components/about.svelte';
  import { m } from '#i18n/messages';
  import { getLocale, type Locale, locales, localizeHref } from '#i18n/runtime';
  import AppFrame from '#libraries/design/app-frame.svelte';
  import DialogButton from '#libraries/design/dialog-button.svelte';
  import '#libraries/design/global.css';
  import InfoIcon from '#libraries/design/info-icon.svelte';
  import SegmentedLinks from '#libraries/design/segmented-links.svelte';
  import { version } from '$app/env';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import type { LayoutProps } from './$types';

  const { children, data }: LayoutProps = $props();

  const sheetHeight = $derived(data.sheets.height);

  $effect(() => {
    const subscription = data.closing.closings.subscribe();
    return (): void => subscription.unsubscribe();
  });

  const hrefFor = (locale: Locale): string => localizeHref(page.url.pathname, { locale });

  const languageLinks = $derived(
    locales.map((locale) => ({
      href: hrefFor(locale),
      lang: locale,
      text: m.language_name({}, { locale }),
      current: locale === getLocale()
    }))
  );
</script>

<svelte:head>
  <title>{m.app_name()}</title>
  <meta name="description" content={m.app_description()} />
</svelte:head>

<AppFrame sheetHeight={$sheetHeight}>
  {@render children()}

  {#snippet bottom()}
    <DialogButton
      label={m.about_label()}
      title={m.app_name()}
      description={m.welcome_title()}
      closeLabel={m.about_close()}
      closable={data.closing.of('about')}
    >
      {#snippet icon()}
        <InfoIcon />
      {/snippet}
      <About
        privacyHref={localizeHref(resolve('/(content)/privacy'))}
        licenseTextsHref={resolve('/licenses/[file]', { file: 'LGPL-3.0-only.txt' })}
        deliveredSourceHref={`https://github.com/untracked-maps/untracked/tree/v${version}`}
      >
        {#snippet languages()}
          <SegmentedLinks label={m.language_switcher_label()} links={languageLinks} reload />
        {/snippet}
      </About>
    </DialogButton>
  {/snippet}
</AppFrame>
