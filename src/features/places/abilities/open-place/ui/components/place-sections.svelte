<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte';
  import '#libraries/design/tokens.css';
  import { expectsHours } from '../../../../domain/expects-hours';
  import PlaceAbout from './place-about.svelte';
  import PlaceDetails from './place-details.svelte';
  import PlaceGoodToKnow from './place-good-to-know.svelte';

  type Props = ComponentProps<typeof PlaceDetails> & {
    readonly hours?: Snippet | undefined;
  };

  const { place, address, onCopy, vibrate, hours }: Props = $props();
</script>

{#snippet facts()}
  <PlaceGoodToKnow {place} />
  {@render hours?.()}
  <PlaceDetails {place} {address} {onCopy} {vibrate} />
{/snippet}

{#if expectsHours(place.kind)}
  {@render facts()}
  <PlaceAbout {place} />
{:else}
  <PlaceAbout {place} />
  {@render facts()}
{/if}
