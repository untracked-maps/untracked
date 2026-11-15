<script lang="ts">
  import type { Observable } from 'rxjs';
  import { m } from '#i18n/messages';
  import { isLocale, type Locale } from '#i18n/runtime';

  type Props = {
    readonly suggestion: Observable<string | undefined>;
    readonly hrefFor: (locale: Locale) => string;
    readonly onDismiss: () => void;
  };

  const { suggestion, hrefFor, onDismiss }: Props = $props();
</script>

{#if isLocale($suggestion)}
  {const locale = $derived($suggestion)}
  <aside lang={locale} aria-label={m.language_suggestion_label({}, { locale })}>
    <p>{m.language_suggestion({}, { locale })}</p>
    <a href={hrefFor(locale)} hreflang={locale} data-sveltekit-reload>{m.language_suggestion_link({}, { locale })}</a>
    <button type="button" onclick={onDismiss}>{m.language_suggestion_dismiss({}, { locale })}</button>
  </aside>
{/if}

<style>
  aside {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    align-items: center;
    padding: 0.5rem 1rem;
    border-block-end: 1px solid;
  }

  p {
    margin: 0;
  }

  a,
  button {
    min-inline-size: 24px;
    min-block-size: 24px;
  }
</style>
