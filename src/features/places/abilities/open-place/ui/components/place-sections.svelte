<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { m } from '#i18n/messages';
  import CopyIcon from '#libraries/design/copy-icon.svelte';
  import '#libraries/design/tokens.css';
  import { expectsHours } from '../../domain/expects-hours';
  import PlaceAbout from './place-about.svelte';
  import PlaceDetails from './place-details.svelte';
  import PlaceGoodToKnow from './place-good-to-know.svelte';

  type Props = ComponentProps<typeof PlaceDetails>;

  const { place, address, onCopy, vibrate }: Props = $props();
</script>

{#snippet facts()}
  <PlaceGoodToKnow {place} />
  <PlaceDetails {place} {address} {onCopy} {vibrate} />
{/snippet}

{#if expectsHours(place.kind)}
  {@render facts()}
  <PlaceAbout {place} />
{:else}
  <PlaceAbout {place} />
  {@render facts()}
{/if}
{#if address !== undefined}
  <div class="actions" data-sheet-actions>
    <button type="button" onclick={(): void => onCopy(address)}><CopyIcon />{m.place_sheet_copy_address()}</button>
  </div>
{/if}

<style>
  .actions {
    display: grid;
    grid-auto-columns: 1fr;
    grid-auto-flow: column;
    gap: 0.375rem;
    margin-block-start: 0.875rem;
  }

  .actions button {
    display: grid;
    gap: var(--space-1);
    place-items: center;
    min-block-size: 2.875rem;
    padding: var(--space-2);
    font: inherit;
    font-size: clamp(0.65625rem, 2.9vw, 0.71875rem);
    font-weight: var(--font-weight-strong);
    color: var(--text);
    cursor: pointer;
    background: var(--surface-sunken);
    border: 0;
    border-radius: 0.875rem;
  }
</style>
