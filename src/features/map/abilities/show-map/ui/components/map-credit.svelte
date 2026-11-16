<script lang="ts">
  import type { Snippet } from 'svelte';
  import { m } from '#i18n/messages';
  import '#libraries/design/tokens.css';

  type Props = {
    readonly children?: Snippet;
  };

  const { children }: Props = $props();
</script>

<p>
  <a href="https://www.openstreetmap.org/copyright" rel="external">{m.map_credit_openstreetmap()}</a>
  · <a href="https://openfreemap.org" rel="external">OpenFreeMap</a>
  · <a href="https://openmaptiles.org" rel="external">{m.map_credit_openmaptiles()}</a>
  {@render children?.()}
</p>

<style>
  p {
    position: relative;
    padding: var(--space-1) var(--space-2);
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--text);
    pointer-events: auto;
    background: var(--surface-translucent);
    border-radius: var(--radius-s);
  }

  p :global(a) {
    display: inline-flex;
    align-items: center;
    min-block-size: 1.5rem;
    color: inherit;
    text-decoration: none;
  }
</style>
