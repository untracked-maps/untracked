<script lang="ts">
  import About from '#features/about/ui/components/about.svelte';
  import { m } from '#i18n/messages';
  import { getLocale, type Locale, locales, localizeHref } from '#i18n/runtime';
  import AppFrame from '#libraries/design/app-frame.svelte';
  import DialogButton from '#libraries/design/dialog-button.svelte';
  import '#libraries/design/global.css';
  import InfoIcon from '#libraries/design/info-icon.svelte';
  import SegmentedLinks from '#libraries/design/segmented-links.svelte';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import type { LayoutProps } from './$types';

  const { children, data }: LayoutProps = $props();

  const sheetHeight = $derived(data.sheets.height);

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
    <DialogButton label={m.about_label()} title={m.app_name()} description={m.welcome_title()} closeLabel={m.about_close()}>
      {#snippet icon()}
        <InfoIcon />
      {/snippet}
      <About privacyHref={localizeHref(resolve('/(content)/privacy'))}>
        {#snippet languages()}
          <SegmentedLinks label={m.language_switcher_label()} links={languageLinks} reload />
        {/snippet}
      </About>
    </DialogButton>
  {/snippet}
</AppFrame>
