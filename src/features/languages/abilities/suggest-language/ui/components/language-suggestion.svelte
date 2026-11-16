<script lang="ts">
  import type { Observable } from 'rxjs';
  import { m } from '#i18n/messages';
  import { isLocale, type Locale } from '#i18n/runtime';
  import Button from '#libraries/design/button.svelte';
  import ButtonLink from '#libraries/design/button-link.svelte';
  import Floating from '#libraries/design/floating.svelte';
  import '#libraries/design/tokens.css';

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
    <Floating>
      <p>{m.language_suggestion({}, { locale })}</p>
      <div class="actions">
        <ButtonLink href={hrefFor(locale)} hreflang={locale} reload>
          {m.language_suggestion_link({}, { locale })}
        </ButtonLink>
        <Button onclick={onDismiss}>{m.language_suggestion_dismiss({}, { locale })}</Button>
      </div>
    </Floating>
  </aside>
{/if}

<style>
  aside {
    inline-size: 100%;
    max-inline-size: 26rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
</style>
