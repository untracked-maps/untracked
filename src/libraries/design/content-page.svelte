<script lang="ts">
  import type { Snippet } from 'svelte';
  import './tokens.css';

  type Props = {
    readonly children: Snippet;
  };

  const { children }: Props = $props();
</script>

<div>
  {@render children()}
</div>

<style>
  div {
    box-sizing: border-box;
    inline-size: 100%;
    max-inline-size: var(--reading-width);
    padding: var(--space-5) var(--gutter);
    margin: 0 auto auto;
    color: var(--text);
    pointer-events: auto;
    background: var(--surface);
    border-radius: var(--radius-l);
    box-shadow: var(--shadow-float);
  }

  @media (width >= 700px) {
    div {
      padding: var(--space-5) calc(var(--gutter) * 2);
    }
  }
</style>
