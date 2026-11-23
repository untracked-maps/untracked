<script lang="ts">
  import { m } from '#i18n/messages';
  import '#libraries/design/tokens.css';
  import type { SheetPlace } from '../../domain/open-place';
  import { callLink, linkOf } from './place-contact.presenter';

  type Props = {
    readonly place: SheetPlace;
  };

  const { place }: Props = $props();
</script>

{#if place.phone !== undefined || place.website !== undefined}
  <div class="actions" data-sheet-actions>
    {#if place.phone !== undefined}
      <a href={callLink(place.phone)}>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M6.6 3.5 9 3l2 4.6-2.3 1.6a12 12 0 0 0 6.1 6.1l1.6-2.3L21 15l-.5 2.4A3 3 0 0 1 17.6 20C10 20 4 14 4 6.4a3 3 0 0 1 2.6-2.9z"
          />
        </svg>
        {m.place_sheet_call()}
      </a>
    {/if}
    {#if place.website !== undefined}
      <a href={linkOf(place.website)} target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.4 3.6 8.5s-1.1 5.9-3.6 8.5M12 3.5C9.5 6.1 8.4 8.9 8.4 12s1.1 5.9 3.6 8.5" />
        </svg>
        {m.place_sheet_website()}
      </a>
    {/if}
  </div>
{/if}

<style>
  .actions {
    display: grid;
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
    gap: 0.375rem;
    margin-block-start: 0.875rem;
  }

  a {
    display: grid;
    gap: var(--space-1);
    place-content: center;
    place-items: center;
    min-block-size: 3.125rem;
    padding: 0.3125rem 0.125rem;
    font-size: clamp(0.65625rem, 3vw, 0.71875rem);
    font-weight: var(--font-weight-strong);
    color: var(--accent);
    white-space: nowrap;
    text-decoration: none;
    background: light-dark(rgb(232 238 252), rgb(34 48 74));
    border-radius: 0.875rem;
  }

  svg {
    inline-size: 1.1875rem;
    block-size: 1.1875rem;
    fill: none;
    stroke: currentcolor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>
