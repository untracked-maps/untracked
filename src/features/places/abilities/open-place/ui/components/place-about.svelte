<script lang="ts">
  import { Subject, startWith } from 'rxjs';
  import { m } from '#i18n/messages';
  import { getLocale } from '#i18n/runtime';
  import '#libraries/design/tokens.css';
  import type { SheetPlace } from '../../domain/open-place';
  import { textOf } from '../../domain/place-text';

  type Props = {
    readonly place: SheetPlace;
    readonly locale?: string;
  };

  const { place, locale = getLocale() }: Props = $props();

  const uid = $props.id();

  const about = $derived(textOf(place.tags, locale));

  const asked = new Subject<string>();

  const whole = asked.pipe(startWith(undefined));

  const cut = $derived(about?.long === true && $whole !== place.id);

  const focusedOnceWhole = (text: HTMLElement): void => {
    asked.subscribe(() => text.focus());
  };
</script>

{#if about !== undefined}
  <section aria-labelledby="{uid}-about">
    <h3 id="{uid}-about">{m.place_sheet_about()}</h3>
    <p {@attach focusedOnceWhole} class={cut ? 'cut' : undefined} tabindex="-1">{about.text}</p>
    {#if cut}
      <button type="button" onclick={(): void => asked.next(place.id)}>{m.place_sheet_about_more()}</button>
    {/if}
  </section>
{/if}

<style>
  section {
    margin-block-start: 1.375rem;
  }

  h3 {
    margin: 0 0 0.5rem;
    font-size: 1.0625rem;
    font-weight: 700;
    color: var(--text);
  }

  p {
    margin: 0;
    font-size: 0.90625rem;
    line-height: 1.45;
    color: var(--text);
    text-wrap: pretty;
  }

  p:focus {
    outline: none;
  }

  .cut {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    -webkit-line-clamp: 4;
    line-clamp: 4;
  }

  button {
    min-block-size: 1.5rem;
    padding: 0;
    font: inherit;
    font-size: 0.90625rem;
    font-weight: var(--font-weight-strong);
    color: var(--accent);
    cursor: pointer;
    background: none;
    border: 0;
  }
</style>
