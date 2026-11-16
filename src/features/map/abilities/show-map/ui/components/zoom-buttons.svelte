<script lang="ts">
  import { m } from '#i18n/messages';
  import IconButton from '#libraries/design/icon-button.svelte';
  import MinusIcon from '#libraries/design/minus-icon.svelte';
  import PlusIcon from '#libraries/design/plus-icon.svelte';
  import type { ZoomStep } from './zoom-overlay';

  type Props = {
    readonly onZoom: (step: ZoomStep) => void;
    readonly ready?: boolean;
  };

  const { onZoom, ready = true }: Props = $props();
</script>

<div>
  <IconButton label={m.zoom_in()} tone="neutral" disabled={!ready} onclick={(): void => onZoom('in')}><PlusIcon /></IconButton>
  <IconButton label={m.zoom_out()} tone="neutral" disabled={!ready} onclick={(): void => onZoom('out')}
    ><MinusIcon /></IconButton
  >
</div>

<style>
  div {
    display: grid;
    gap: var(--space-3);
  }

  @media not ((hover: hover) and (pointer: fine)) {
    div {
      display: none;
    }
  }
</style>
