<script lang="ts">
  import type { Snippet } from 'svelte';
  import Floating from './floating.svelte';
  import IconButton from './icon-button.svelte';
  import './tokens.css';

  type Props = {
    readonly label: string;
    readonly icon: Snippet;
    readonly children: Snippet;
  };

  const { label, icon, children }: Props = $props();

  const uid = $props.id();
</script>

<IconButton {label} toggles="{uid}-panel" tone="neutral">{@render icon()}</IconButton>

<dialog id="{uid}-panel" popover="auto" aria-label={label}>
  <Floating>
    <div class="sections">
      {@render children()}
    </div>
  </Floating>
</dialog>

<style>
  dialog {
    inset: auto;
    box-sizing: border-box;
    inline-size: min(20rem, 100vw - 2 * var(--edge));
    padding: 0;
    margin: 0 0 var(--space-2);
    position-area: block-start span-inline-start;
    position-try-fallbacks: flip-block;
    overflow: visible;
    background: none;
    border: 0;
  }

  .sections {
    display: grid;
    gap: var(--space-4);
  }

  .sections > :global(* + *) {
    padding-block-start: var(--space-4);
    border-block-start: 1px solid var(--line);
  }
</style>
